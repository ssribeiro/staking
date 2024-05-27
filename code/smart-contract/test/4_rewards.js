const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");
const tolerance = 0.0001; // (1.5%) A small tolerance is allowed because we use a different algorithm in order to verify the compounded interest

contract("Staking - Reward", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });

        // Mint some tokens to the staking smart contract
        await instanceToken.mint(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
    });

    it("Do a simple claim for a user", async function() {
        await instanceStaking.stake(AMOUNT, { from: user });
        const period = 7776000 // 3 month

        // Simulate a waiting period (in second)
        await time.increase(time.duration.seconds(period)); // 3 month

        const balance = await instanceStaking.balanceOf(user);
        const rewards = Number(balance.rewards);
        assert.isTrue(balance.rewards > 0, "The total rewards we should have");

        const balanceToken = Number(await instanceToken.balanceOf(user));
        await instanceStaking.claimRewards({ from: user });
        const balanceToken1 = Number(await instanceToken.balanceOf(user));

        const rewardsReceived = balanceToken1 - balanceToken;
        const rewardsEffective = getRewardEffective(AMOUNT, APY, period);

        const diff = Math.abs(100 - (rewardsReceived * 100 / rewardsEffective));
        assert.isTrue(diff <= tolerance, "The total of rewards received should be the same as the effective one");

        const diff1 = Math.abs(100 - (rewards * 100 / rewardsEffective));
        assert.isTrue(diff1 <= tolerance, "The total of rewards from pending should be the same as the effective one");
    });

    it("Do multiple claims for a user", async function() {
        await instanceStaking.stake(AMOUNT, { from: user });
        const period = 7776000 // 3 month

        // Simulate a waiting period (in second)
        await time.increase(time.duration.seconds(period)); // 3 month

        const balance = await instanceStaking.balanceOf(user);
        const rewards = Number(balance.rewards);
        assert.isTrue(balance.rewards > 0, "The total rewards we should have");

        const balanceToken = Number(await instanceToken.balanceOf(user));
        await instanceStaking.claimRewards({ from: user });
        const balanceToken1 = Number(await instanceToken.balanceOf(user));

        const rewardsReceived = balanceToken1 - balanceToken;
        const rewardsEffective = getRewardEffective(AMOUNT, APY, period);

        const diff = Math.abs(100 - (rewardsReceived * 100 / rewardsEffective));
        assert.isTrue(diff <= tolerance, "The total of rewards received should be the same as the effective one");

        const diff1 = Math.abs(100 - (rewards * 100 / rewardsEffective));
        assert.isTrue(diff1 <= tolerance, "The total of rewards from pending should be the same as the effective one");
    });

    it("Do a claim after unstake and then stake again", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });

        const data = await calculateCompoundedRewards(user, AMOUNT, 5, 7776000); // 3 month
        const diff = Math.abs(100 - (Number(data.rewards) * 100 / Number(data.rewardsEffective)));
        assert.isTrue(diff <= tolerance, "The total rewards we should have");

        // Call the unstake function
        await instanceStaking.unstake({ from: user });

        // Call the stake function
        await instanceStaking.stake(AMOUNT, { from: user });

        // Get new rewards
        const data1 = await calculateCompoundedRewards(user, AMOUNT, 25, 604800); // 1 week boost
        const diff1 = Math.abs(100 - (Number(data1.rewards) * 100 / Number(data1.rewardsEffective)));

        assert.isTrue(diff1 <= tolerance, "The total rewards we should have");
    });

    it("Check a empty balance of rewards", async function() {
        const balance = await instanceStaking.balanceOf(user);

        assert.equal(balance.rewards, 0, "The total of rewards should be 0");
    });

    it("Check the rewards for a fix APY", async function() {
        await instanceStaking.stake(AMOUNT, { from: user });
        const period = 7776000 // 3 month

        const data = await calculateCompoundedRewards(user, AMOUNT, APY, period); // 3 month
        const rewards = Number(data.rewards);
        const diff = Math.abs(100 - (rewards * 100 / Number(data.rewardsEffective)));

        assert.isTrue(diff <= tolerance, "The total of rewards from pending should be the same as the effective one");
    });

    it.only("Check rewards during multiple APY change", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Based APY
        let amount = Number(AMOUNT);
        const data = await calculateCompoundedRewards(user, amount, 5, 7776000); // 3 month
        const diff = Math.abs(100 - (Number(data.rewards) * 100 / Number(data.rewardsEffective)));

        assert.isTrue(diff <= tolerance, "The total rewards we should have");

        // Boost for 1 week
        amount += Number(data.rewards);
        const data1 = await calculateCompoundedRewards(user, amount, 25, 604800); // 1 week boost
        const rewards = data1.rewards - data.rewards; // Get the reward for the period
        const diff1 = Math.abs(100 - (Number(rewards) * 100 / Number(data1.rewardsEffective)));
        assert.isTrue(diff1 <= tolerance, "The total rewards we should have");

        // Return to base APY
        amount += Number(rewards);
        const data2 = await calculateCompoundedRewards(user, amount, 5, 7776000); // 1 week boost
        const rewards1 = data2.rewards - data1.rewards; // Get the reward for the period
        const diff2 = Math.abs(100 - (Number(rewards1) * 100 / Number(data2.rewardsEffective)));

        assert.isTrue(diff2 <= tolerance, "The total rewards we should have");
    });
});

function getRewardEffective(amount, apy, period) {
    amount = Number(web3.utils.fromWei(AMOUNT, "ether"));

    // Convert annual rate to per-second rate
    const ratePerSecond = apy / 100 / (365 * 24 * 60 * 60);

    // Calculate the accumulated amount (A) using the per-second rate
    const compounded = amount * (1 + ratePerSecond * period);
    return Number(web3.utils.toWei(String(compounded - amount), 'ether'));
}

async function calculateCompoundedRewards(user, amount, apy, period) {

    // Convert annual rate to per-second rate
    const ratePerSecond = apy / 100 / (365 * 24 * 60 * 60);

    // Calculate the accumulated amount (A) using the per-second rate
    const compounded = amount * (1 + ratePerSecond * period);
    const rewardsEffective = (compounded - Number(amount));

    // Emulate time
    await instanceStaking.setApy(apy);
    await time.increase(period);

    // Get the rewards
    const balance = await instanceStaking.balanceOf(user);
    const rewards = Number(balance.rewards);

    return {
        rewards,
        rewardsEffective
    }
}
