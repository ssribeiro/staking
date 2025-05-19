const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("StakingV2");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("StakingV2 - Stake Error", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    before(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });
    });

    it("Try to stake 0 token", async function () {
        // Wrong amount
        await expectRevert(instanceStaking.stake(0, {from: user}), "Cannot stake 0 tokens");
    });

    it("Try to stake without having tokens", async function () {
        // No token available
        await expectRevert(instanceStaking.stake(AMOUNT, {from: user}), "No fund available");
    });

    it("Try to stake with a paused state", async function () {
        await instanceStaking.pause();
        await expectRevert.unspecified(instanceStaking.stake(AMOUNT, {from: user}));
    });
});
