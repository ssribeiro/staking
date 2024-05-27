const { expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";

contract("Staking - General Permission", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    before(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });

        // Approve the staking contract to spend tokens on behalf of the user
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });
    });

    it("Try to change the APY from a non-owner", async () => {
        await expectRevert.unspecified(instanceStaking.setApy.call(20, {from: user}));
    });

    it("Try to change the lock period from a non-owner", async () => {
        await expectRevert.unspecified(instanceStaking.setLock.call(120, {from: user}));
    });

    it("Try to pause from a non-owner", async () => {
        await expectRevert.unspecified(instanceStaking.pause.call({from: user}));
    });

    it("Try to unpause from a non-owner", async () => {
        await expectRevert.unspecified(instanceStaking.unpause.call({from: user}));
    });

    it("Try to widthdraw from a non-owner", async () => {
        await expectRevert.unspecified(instanceStaking.withdraw.call({from: user}));
    });
});
