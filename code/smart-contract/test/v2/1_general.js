const { time } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("StakingV2");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("StakingV2 - General", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });

        // Approve the staking contract to spend tokens on behalf of the user
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });
    });

    it("Change the APY", async () => {
        const apy = await instanceStaking.apy.call();
        assert.equal(apy, APY, "APY not as expected");

        await instanceStaking.setApy(120);
        const apy1 = await instanceStaking.apy.call();
        assert.equal(apy1, "120", "APY not as expected");
    });

    it("Change the Lock period", async () => {
        const lock = await instanceStaking.lock.call();
        assert.equal(lock, LOCK, "Lock not as expected");

        await instanceStaking.setLock(120);
        const lock1 = await instanceStaking.lock.call();
        assert.equal(lock1, "120", "Lock not as expected");
    });

    it("Do a pause on the smart contract", async () => {
        const isPaused = await instanceStaking.paused.call();
        assert.equal(isPaused, false, "Should not be paused");

        await instanceStaking.pause();
        const isPaused1 = await instanceStaking.paused.call();
        assert.equal(isPaused1, true, "Should be paused");
    });

    it("Do a unpause on the smart contract", async () => {
        const isPaused = await instanceStaking.paused.call();
        assert.equal(isPaused, false, "Should not be paused");

        await instanceStaking.pause();
        const isPaused1 = await instanceStaking.paused.call();
        assert.equal(isPaused1, true, "Should be paused");

        await instanceStaking.unpause();
        const isPaused2 = await instanceStaking.paused.call();
        assert.equal(isPaused2, false, "Should not be paused");
    });
    
    it("Do calculate remaining time after lock period", async () => {
        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the user's staked balance
        const userBalance = await instanceStaking.userBalanceInitial(user);
        assert.equal(userBalance.toString(), AMOUNT, "The user's staked balance should match the staked amount");

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Check the total balance of the user
        const userBalanceBalanceOf = await instanceStaking.balanceOf(user);
        assert.equal(userBalanceBalanceOf[2].toString(), AMOUNT, "The user balance amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(LOCK + 10));

        const userBalanceBalanceOfAfter = await instanceStaking.balanceOf(user);
        assert(userBalanceBalanceOfAfter[1] < 0, "The remaining time should be 0");
    })
});
