const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("Staking - Reward Error", function (accounts) {
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

    it("Try to claim rewards with fund on the smart contract", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });

        await time.increase(time.duration.seconds(1200));

        const balance = await instanceStaking.balanceOf(user);
        assert.isTrue(balance.rewards > 0, "The total rewards we should have");

        await expectRevert(instanceStaking.claimRewards({ from: user }), "No fund available");
    });

    it("Try to claim rewards with a paused state", async function () {
        await instanceStaking.stake(AMOUNT, { from: user });

        await time.increase(120);

        await instanceStaking.pause();
        await expectRevert.unspecified(instanceStaking.claimRewards({ from: user }));
    });
});
