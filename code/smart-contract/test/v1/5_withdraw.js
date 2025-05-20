const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let SUPPLY2 = "20000000";

contract("Staking - Withdraw", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });
    });

    xit("Do a simple withdraw", async () => {
        await instanceToken.mint(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: owner });

        const balance = await instanceToken.balanceOf(instanceStaking.address);
        const balanceOwner = BigInt(await instanceToken.balanceOf(owner));
        assert.equal(balance, web3.utils.toWei(SUPPLY), "The balance should be the token send to the contract");

        await instanceStaking.withdraw({ from: owner });

        const balance1 = await instanceToken.balanceOf(instanceStaking.address);
        assert.equal(balance1.toString(), 0, "The balance should be 0");

        const balanceOwner1 = await instanceToken.balanceOf(owner);
        const balanceOwnerTotal = balanceOwner + BigInt(web3.utils.toWei(SUPPLY));
        assert.equal(balanceOwnerTotal.toString(), balanceOwner1.toString(), "The balance should be the amount withdrawn");
    });

    xit("Do a simple withdraw after stake", async () => {
        await instanceToken.mint(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceStaking.stake(web3.utils.toWei(SUPPLY, "ether"), { from: user });

        const balance = await instanceToken.balanceOf(instanceStaking.address);
        const balanceOwner = BigInt(await instanceToken.balanceOf(owner));
        assert.equal(balance.toString(), web3.utils.toWei(SUPPLY2), "The balance should be the token send to the contract + the stake");

        await instanceStaking.withdraw({ from: owner });

        const balance1 = await instanceToken.balanceOf(instanceStaking.address);
        assert.equal(balance1.toString(),  web3.utils.toWei(SUPPLY), "The balance should be 0");

        const balance2 = BigInt(await instanceToken.balanceOf(instanceStaking.address));
        assert.equal(balance2.toString(), web3.utils.toWei(SUPPLY), "The balance should be the amount stake");
    });
});
