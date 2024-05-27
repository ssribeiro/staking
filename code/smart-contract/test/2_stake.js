const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("Staking - Stake", (accounts) => {
    const owner = accounts[0];
    const user = accounts[1];
    const user1 = accounts[2];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });

        await instanceToken.mint(user1, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user1 });
    });

    it("Do a simple staking for a user", async function () {

        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the user's staked balance
        const userBalance = await instanceStaking.userBalanceInitial(user);
        assert.equal(userBalance.toString(), AMOUNT, "The user's staked balance should match the staked amount");

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");
    });

    it("Do a double staking for a user", async () => {

        // First stake

        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the user's staked balance
        const userBalance = await instanceStaking.userBalanceInitial(user);
        assert.equal(userBalance.toString(), AMOUNT, "The user's staked balance should match the staked amount");

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Second stake

        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the user's staked balance
        const userBalance1 = await instanceStaking.userBalanceInitial(user);
        assert.equal(userBalance1.toString(), AMOUNT * 2, "The user's staked balance should match the staked amount");

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), AMOUNT * 2, "The total staked amount should match the staked amount");
    });

    it("Do a double staking for 2 different users", async () => {
        // First stake

        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the user's staked balance
        const userBalance = await instanceStaking.userBalanceInitial(user);
        assert.equal(userBalance.toString(), AMOUNT, "The user's staked balance should match the staked amount");

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Second stake

        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user1 });

        // Check the user's staked balance
        const userBalance1 = await instanceStaking.userBalanceInitial(user1);
        assert.equal(userBalance1.toString(), AMOUNT, "The user's staked balance should match the staked amount");

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), AMOUNT * 2, "The total staked amount should match the staked amount");
    });
});
