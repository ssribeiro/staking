const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("Staking - Unstake", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];
    const user1 = accounts[2];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user1, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user1 });

        // Mint some tokens to the staking smart contract
        await instanceToken.mint(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
    });

    it("Do a simple unstaking for a user", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Call the stake function
        await instanceStaking.unstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), 0, "The total staked amount should match the staked amount");
    });

    it("Do a simple unstaking for a user after the lock change", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Call the stake function
        await instanceStaking.unstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), 0, "The total staked amount should match the staked amount");
    });

    it("Do a simple unstaking for a user when 2 users have staked", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });
        await instanceStaking.stake(AMOUNT, { from: user1 });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT * 2, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Call the stake function
        await instanceStaking.unstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), AMOUNT, "The total staked amount should match the staked amount");
    });
});

