// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

// Struct to hold user data
struct UserData {
	uint256 lockStart;       // The time when the user last staked
	int256 lockRemaining;    // The time remaining before unlock
	uint256 balance;         // The balance of staked tokens
	uint256 rewards;         // The balance of rewards
}

contract StakingV2 is Ownable, Pausable, ReentrancyGuard {
	
	// Keep the normalized balance of stake tokens for a user
	mapping(address => uint256) public userBalance;
	
	// Keep the initial balance of stake tokens for a user
	mapping(address => uint256) public userBalanceInitial;
	
	// Timestamp when the user last staked
	mapping(address => uint256) public userLock;

	// Timestamp when the user's lock period ends (when they can unstake)
	mapping(address => uint256) public userUnlockTime;

	// Timestamp of the user's last starvation unstake (0 means never)
	mapping(address => uint256) public userStarvationUnstakeTime;
	
	// Address of the vault to hold reward tokens
	address public immutable vault;
	
	// Address of the token to be staked
	IERC20 public immutable token;
	
	// Total amount of tokens staked
	uint256 public totalStaked;
	
	// APY of the rewards (in percentage ex. 20)
	uint16 public apy;
	
	// Lock time (in seconds)
	uint256 public lock;

	// Temporary beneficial lock period (0 means not set)
	uint256 public shorterLock;
	
	// Global compound index for calculating compound interest
	uint256 public compoundIndex;
	
	// Last update time for the compound index
	uint256 public lastUpdateTime;

	// Starvation flag with the amount needed to cover the largest pending reward
	// (plus totalStake less contract balance) (0 means no starvation)
	uint256 public starvationFlag;

    // compoundIndex precision
	uint256 constant ONE = 1e18;

	// number representing 100% in apy calculations
	uint256 constant APY_ONE = 100;

	// seconds in a year: 365 * 24 * 60 * 60
	uint256 constant YEAR = 31536000;
	
	// Events
	event Stake(address indexed user, uint256 amount);
	event Unstake(address indexed user, uint256 amount);
	event StarvationUnstake(address indexed user, uint256 unstakeAmount, uint256 stakeAmount);
	event Claim(address indexed user, uint256 amount);
	event Withdraw(address indexed vault, uint256 amount);
	event ApySet(uint256 apy);
	event LockSet(uint256 lock);
	event ShorterLockSet(uint256 lock);
	event StarvationFlagSet(uint256 starvationFlag);
	
	constructor(IERC20 _token, address _owner, address _vault, uint16 _apy, uint256 _lock) Ownable(_owner) {
		token = _token;
		apy = _apy;
		lock = _lock;
		vault = _vault;
		compoundIndex = ONE;  // Initialize to 1.0 (scaled by 1e18 for precision)
		lastUpdateTime = block.timestamp;

		emit ApySet(_apy);
		emit LockSet(_lock);
	}
	
	/*
	* Internal function to update the compound index based on the elapsed time
	* @params _amount The amount to stake (in wei)
    */
	function stake(uint256 _amount) external nonReentrant whenNotPaused {
		require(_amount > 0, "Cannot stake 0 tokens");
		require(_amount <= token.balanceOf(msg.sender), "No fund available");
		
		// Update the compound index
		updateIndex();
		
		// Transfer the tokens from the user to the contract
		token.safeTransferFrom(msg.sender, address(this), _amount);
		
		// Calculate the adjusted amount based on the current compound index
		uint256 adjustedAmount = (_amount * ONE) / compoundIndex;
		
		// Update the user
		userBalance[msg.sender] += adjustedAmount;
		userBalanceInitial[msg.sender] += _amount;
		userLock[msg.sender] = block.timestamp;
		// Set to the later of the current unlock time or new lock
		uint256 newLockTime = block.timestamp + lock;
		if(userUnlockTime[msg.sender] < newLockTime) {
			userUnlockTime[msg.sender] = newLockTime;
		}
		delete userStarvationUnstakeTime[msg.sender];
		
		totalStaked += _amount;
		
		emit Stake(msg.sender, _amount);
	}
	
	/*
	* Function to unstake
    */
	function unstake() external nonReentrant {
		uint256 _amount = userBalanceInitial[msg.sender];
		
		require(_amount > 0, "Cannot unstake 0 tokens");
		bool normalUnlock = block.timestamp >= userUnlockTime[msg.sender];
		if(shorterLock > 0) {
			bool beneficiaryUnlock = userLock[msg.sender] + shorterLock < block.timestamp;
			require(normalUnlock||beneficiaryUnlock, "Tokens are locked");
		} else {
			require(normalUnlock, "Tokens are locked");
		}
		
		// Update the compound index
		updateIndex();
		
		// Calculate rewards
		uint256 userCompoundBalance = (userBalance[msg.sender] * compoundIndex) / ONE;
		require(userCompoundBalance > _amount, "Await compound index update");
		uint256 rewards = userCompoundBalance - _amount;
		
		// Transfer the total amount back to the user
		uint256 thisBalance = token.balanceOf(address(this));
		require(thisBalance >= totalStaked, "No fund available");
		require(thisBalance - totalStaked >= rewards, "No fund available");
		token.safeTransfer(msg.sender, userCompoundBalance);
		
		// Update the user
		delete userBalance[msg.sender];
		delete userBalanceInitial[msg.sender];
		delete userLock[msg.sender];
		delete userStarvationUnstakeTime[msg.sender];

		totalStaked -= _amount;
		
		emit Unstake(msg.sender, _amount);
		emit Claim(msg.sender, rewards);
	}

	/*
	* Function to unstake when the contract is "starving".
	* "Starving" means the contract had not enough tokens to pay out at least one requested reward.
	* This function guarantees users can always withdraw at least their principal (no profits)
	* after the lock period, even if the contract is underfunded. 
	* Any rewards are restaked and can be claimed when the contract is refilled.
	* Each user can only perform a starvation unstake once until the starvation ends, 
	* to ensure everybody can withdraw their piece.
	* This sets the starvation flag, which pauses new stakes and signals the need for more tokens.
	* The contract cannot be unpaused until it is refilled with enough tokens to pay the largest outstanding reward.
	* User can stake on this contract with the guarantee that they will be able to withdraw their original amount, 
	* at least, enforced by this contract, regardless the administration or governance decisions.
	*/
	function starvingUnstake() external nonReentrant {
        uint256 _amount = userBalanceInitial[msg.sender];
        
        require(_amount > 0, "Cannot unstake 0 tokens");
        bool normalUnlock = block.timestamp >= userUnlockTime[msg.sender];
		if(shorterLock > 0) {
			bool beneficiaryUnlock = userLock[msg.sender] + shorterLock < block.timestamp;
			require(normalUnlock||beneficiaryUnlock, "Tokens are locked");
		} else {
			require(normalUnlock, "Tokens are locked");
		}
        
        // Update the compound index
        updateIndex();
        
        // Calculate rewards
        uint256 userCompoundBalance = (userBalance[msg.sender] * compoundIndex) / ONE;
		require(userCompoundBalance > _amount, "Await compound index update");
        uint256 rewards = userCompoundBalance - _amount;
        
        // Calculate if we can pay the rewards
		uint256 thisBalance = token.balanceOf(address(this));
		if(thisBalance >= totalStaked) {
        	require(thisBalance - totalStaked < rewards, "Not starving. Please use unstake");
		}

		// Check if the user has already made a starving unstake
		require(userStarvationUnstakeTime[msg.sender] == 0, "Already made a starving unstake");
		userStarvationUnstakeTime[msg.sender] = block.timestamp;

		// Calculate the amount left to restake
		uint256 starvingAmountLeft = userCompoundBalance - _amount;
		uint256 adjustedStarvingAmountLeft = (starvingAmountLeft * ONE) / compoundIndex;

		// Update the user
		userBalance[msg.sender] = adjustedStarvingAmountLeft;
		userBalanceInitial[msg.sender] = starvingAmountLeft;

		// Transfer the maximum possible to the user, at least his staked original amount
		token.safeTransfer(msg.sender, _amount);

		// Update totalStaked to match contract balance
		totalStaked = totalStaked + starvingAmountLeft - _amount;

        // If rewards is greater than current starving flag, update it
		if (starvationFlag < rewards) {
			starvationFlag = rewards;
			if(!paused()) {
				_pause();
			}
			emit StarvationFlagSet(starvationFlag);
		}
        
        emit StarvationUnstake(msg.sender, _amount, starvingAmountLeft);
    }
	
	/*
	* Function to claim rewards
	*/
	function claimRewards() external nonReentrant whenNotPaused {
		uint256 userStakedAmount = userBalanceInitial[msg.sender];
		require(userStakedAmount > 0, "No tokens staked");
		
		// Update the compound index
		updateIndex();
		
		// Calculate the rewards
		uint256 userCompoundBalance = (userBalance[msg.sender] * compoundIndex) / ONE;
		uint256 rewards = userCompoundBalance - userStakedAmount;
		
		require(rewards > 0, "No rewards available");
		uint256 thisBalance = token.balanceOf(address(this));
		require(thisBalance >= totalStaked, "No fund available");
		require(thisBalance - totalStaked >= rewards, "No fund available");
		
		// Transfer the rewards to the user
		token.safeTransfer(msg.sender, rewards);
		
		// Update the balance
		userBalance[msg.sender] = userStakedAmount * ONE / compoundIndex;
		
		emit Claim(msg.sender, rewards);
	}
	
	/*
	* Function to check the balance of a user
	* @params _user Address of the user to check
	*/
	function balanceOf(address _user) public view returns (UserData memory) {
		int256 remaining = int256(userUnlockTime[_user]) - int256(block.timestamp);
		
		UserData memory data;
		
		data.lockStart = userLock[_user];
		data.lockRemaining = remaining;
		data.balance = userBalanceInitial[_user];
		data.rewards = pendingRewards(_user);
		
		return data;
	}
	
	// HELPERS
	
	/*
	* Internal function to update the compound index based on the elapsed time
    */
	function updateIndex() internal {
		if (block.timestamp > lastUpdateTime) {
			compoundIndex = calculateUpdatedIndex();
			lastUpdateTime = block.timestamp;
		}
	}
	
	/*
	* Internal function to calculate the pending rewards of a user
	* @param _user user to calculate rewards for
    */
	function pendingRewards(address _user) internal view returns (uint256) {
		uint256 userStakedAmount = userBalanceInitial[_user];
		if (userStakedAmount == 0) return 0;

		uint256 currentCompoundIndex = calculateUpdatedIndex();		
		uint256 userCompoundBalance = (userBalance[_user] * currentCompoundIndex) / ONE;
		uint256 rewards = userCompoundBalance - userStakedAmount;
		
		return rewards;
	}

	function calculateUpdatedIndex() internal view returns (uint256 indexUpdated) {
		uint256 timeElapsed = block.timestamp - lastUpdateTime;
		uint256 _compoundIndex = compoundIndex;
		indexUpdated = _compoundIndex + _compoundIndex * uint256(apy) * timeElapsed / (APY_ONE * YEAR);
	}
	
	// ADMIN
	
	/*
	* Function to withdraw rewards
	* Only the fund added for the rewards can be withdrawn.
	*/
	function withdraw() external onlyOwner {
		uint256 thisBalance = token.balanceOf(address(this));
		require(thisBalance >= totalStaked, "No rewards to withdraw");
		require(thisBalance - totalStaked > 0, "No rewards to withdraw");
		
		uint256 balance = thisBalance - totalStaked;
		token.safeTransfer(vault, balance);
		
		emit Withdraw(vault, balance);
	}

	/*
	* Function to set the APY
	* @params _apy The new apy. Effective immediately. in percent, like 20 (meaning 20%)
	*/
	function setApy(uint16 _apy) external onlyOwner {
		updateIndex();
		apy = _apy;
		
		emit ApySet(_apy);
	}
	
	/*
	* Function to set lock period
	* This won't affect the current users, only new ones.
	* @params _lock The new lock period (in seconds). Effective immediately. 1 day = 86 400 seconds
	*/
	function setLock(uint256 _lock) external onlyOwner {
		lock = _lock;
		
		emit LockSet(_lock);
	}

	/*
	* Function to set a temporary, shorter lock period
	* This will allow any user to unlock their tokens before the lock period ends,
	* if set to a value greater than 0 and less than the lock period stored for the user.
	* @params _lock The new lock period (in seconds). 0 means NOT set.
	*/
	function setShorterLock(uint256 _lock) external onlyOwner {
		shorterLock = _lock;
		
		emit ShorterLockSet(_lock);
	}
	
	/*
	* Function to pause the staking
	*/
	function pause() external onlyOwner {
		require(!paused(), "Staking is already paused");
		_pause();
	}
	
	/*
	* Function to unpause the staking
	*/
	function unpause() external onlyOwner {
		require(paused(), "Staking is not paused");
		if (starvationFlag > 0) {
			// Check if the contract has enough tokens to cover the starving flag
			uint256 thisBalance = token.balanceOf(address(this));
			require(thisBalance >= totalStaked, "Cannot unpause while staking is starving");
			require(thisBalance - totalStaked >= starvationFlag, "Cannot unpause while staking is starving");
			delete starvationFlag;
			emit StarvationFlagSet(0);
		}
		_unpause();
	}
}
