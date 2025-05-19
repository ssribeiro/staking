const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("StakingV2");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("StakingV2 - Unstake Error", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });
    });

    it("Try to unstake without having stake before", async function () {
        // Unstake too soon
        await expectRevert(instanceStaking.unstake({from: user}), "Cannot unstake 0 tokens");
    });

    it("Try to unstake before the lock period ends", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });
        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");
    });

    it("Try to unstake without having fund the smart contract with rewards", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });
        await time.increase(120);
        await expectRevert(instanceStaking.unstake({from: user}), "No fund available");
    });

    it("Try to unstake sooner after a favorable minor lock time", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });
        await time.increase(31);
        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");
        // set the lock time to 30 seconds
        await instanceStaking.setLock(30, { from: owner });
        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");
    });

    it("Try to unstake sooner after shorter lock time unset", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });
        await time.increase(31);
        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");
        // set the lock time to 30 seconds
        await instanceStaking.setShorterLock(30, { from: owner });
        // unset the shorter lock time
        await instanceStaking.setShorterLock(0, { from: owner });

        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");
    });
});

