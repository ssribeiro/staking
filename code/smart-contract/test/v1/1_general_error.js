const {expectRevert} = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";

contract("Staking - General Error", function (accounts) {
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

    xit("Try to pause two times in a row", async () => {
        const isPaused = await instanceStaking.paused.call();
        assert.equal(isPaused, false, "Should not be paused");

        await instanceStaking.pause();
        const isPaused1 = await instanceStaking.paused.call();
        assert.equal(isPaused1, true, "Should be paused");

        await expectRevert(instanceStaking.pause(), "Staking is already paused");
    });

    xit("Try to unpause two times in a row", async () => {
        const isPaused = await instanceStaking.paused.call();
        assert.equal(isPaused, false, "Should not be paused");

        await expectRevert(instanceStaking.unpause(), "Staking is not paused");
    });
});
