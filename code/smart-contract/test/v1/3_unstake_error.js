const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("Staking - Unstake Error", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });
    });

    xit("Try to unstake without having stake before", async function () {
        // Unstake too soon
        await expectRevert(instanceStaking.unstake({from: user}), "Cannot unstake 0 tokens");
    });

    xit("Try to unstake before the lock period ends", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });
        await expectRevert(instanceStaking.unstake({from: user}), "Tokens are locked");
    });

    xit("Try to unstake without having fund the smart contract with rewards", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });
        await time.increase(120);
        await expectRevert(instanceStaking.unstake({from: user}), "No fund available");
    });

    xit("Try to unstake with a paused state", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });

        await time.increase(120);

        await instanceStaking.pause();
        await expectRevert.unspecified(instanceStaking.unstake({from: user}), "Pausable: paused");
    });
});

