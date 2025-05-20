const { time, expectRevert } = require("@openzeppelin/test-helpers");
const Staking = artifacts.require("StakingV2");
const Token = artifacts.require("Token");

let instanceStaking = "";
let instanceToken = "";
let APY = 5;
let LOCK = 60;
let SUPPLY = "10000000";
let AMOUNT = web3.utils.toWei("1000000", "ether");

contract("StakingV2 - Starving Unstake", function (accounts) {
    const owner = accounts[0];
    const user = accounts[1];
    const user1 = accounts[2];
    const user2 = accounts[3];

    beforeEach(async () => {
        instanceToken = await Token.new({ from: owner });
        instanceStaking = await Staking.new(instanceToken.address, owner, owner, APY, LOCK, { from: owner });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user1, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user1 });

        // Mint some tokens to the user & approve
        await instanceToken.mint(user2, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        await instanceToken.approve(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: user2 });
    });

    it.only("Do a simple starving unstaking for a user", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Check the rewards amount and balance before unstaking
        const balanceBefore = await instanceToken.balanceOf(user);
        const rewardsAmount = (await instanceStaking.balanceOf(user))[3];

        // Call the stake function
        await instanceStaking.starvingUnstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), rewardsAmount, "The total staked amount should match the rewards amount");

        // Check token balance on user account after
        const balanceAfter = await instanceToken.balanceOf(user);
        const totalRecovered = BigInt(balanceAfter.toString()) - BigInt(balanceBefore.toString());
        assert.equal(totalRecovered.toString(), AMOUNT, "The total recovered amount should match the principal");
    });

    it("Do an starving unstaking for a user after pause", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Check the rewards amount and balance before unstaking
        const rewardsAmount = (await instanceStaking.balanceOf(user))[3];
        const balanceBefore = await instanceToken.balanceOf(user);

        // Call the stake function
        await instanceStaking.pause();
        await instanceStaking.starvingUnstake({from: user});

        const balanceAfter = await instanceToken.balanceOf(user);
        const totalRecovered = BigInt(balanceAfter.toString()) - BigInt(balanceBefore.toString());
        assert.equal(totalRecovered.toString(), AMOUNT, "The total recovered amount should match the principal");

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), rewardsAmount, "The total staked amount should match the rewards amount");
    });

    it("Do an starving unstaking for 3 users who have staked", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });
        await instanceStaking.stake(AMOUNT, { from: user1 });
        await instanceStaking.stake(AMOUNT, { from: user2 });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT * 3, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // calculate rewards
        const rewards1 = (await instanceStaking.balanceOf(user))[3];
        const rewards2 = (await instanceStaking.balanceOf(user1))[3];
        const rewards3 = (await instanceStaking.balanceOf(user2))[3];
        assert.equal(rewards1.toString(), rewards2.toString(), "The rewards amount should match the rewards amount");
        assert.equal(rewards1.toString(), rewards3.toString(), "The rewards amount should match the rewards amount");


        // Call the stake function
        await instanceStaking.starvingUnstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        const expectedTotalStaked1 = (BigInt(AMOUNT) * 2n) + BigInt(rewards1.toString());
        assert.equal(totalStaked1.toString(), expectedTotalStaked1.toString(), "The total staked amount should match the staked amount");

        // Call the stake function
        await instanceStaking.starvingUnstake({from: user1});
        
        // Check the total staked amount
        const totalStaked2 = await instanceStaking.totalStaked();
        const expectedTotalStaked2 = (BigInt(AMOUNT)) + (BigInt(rewards1.toString())*2n);
        assert.equal(totalStaked2.toString(), expectedTotalStaked2.toString(), "The total staked amount should match the staked amount");
        
        // Call the stake function
        await instanceStaking.starvingUnstake({from: user2});
        
        // Check the total staked amount
        const totalStaked3 = await instanceStaking.totalStaked();
        const expectedTotalStaked3 = BigInt(rewards1.toString())*3n;
        assert.equal(totalStaked3.toString(), expectedTotalStaked3.toString(), "The total staked amount should match the staked amount");
    });

    it("Do an starving unstake for a user after the lock change to higher time, with original lock", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        await expectRevert(instanceStaking.starvingUnstake({from: user}), "Tokens are locked");

        // Speed up the time
        await time.increase(time.duration.seconds(50));

        await expectRevert(instanceStaking.starvingUnstake({from: user}), "Tokens are locked");

        // Increase the lock time
        await instanceStaking.setLock(LOCK + 60, { from: owner });

        // Speed up the time
        await time.increase(time.duration.seconds(12));

        // Check the rewards amount and balance before unstaking
        const rewardsAmount = (await instanceStaking.balanceOf(user))[3];

        // Call the stake function
        await instanceStaking.starvingUnstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), rewardsAmount, "The total staked amount should match the staked amount");
    });

    it("Do an starving unstake sooner if admin set shorter lock time", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(31));

        // Call the stake function
        await expectRevert(instanceStaking.starvingUnstake({from: user}), "Tokens are locked");

        // set shorter lock
        await instanceStaking.setShorterLock(30, { from: owner });

        // Check the rewards amount and balance before unstaking
        const rewardsAmount = (await instanceStaking.balanceOf(user))[3];

        await instanceStaking.starvingUnstake({from: user});

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), rewardsAmount.toString(), "The total staked amount should match the staked amount");
    })

    it("Do unpause after starving unstaking and top up the contract", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Check the rewards amount and balance before unstaking
        const rewardsAmount = (await instanceStaking.balanceOf(user))[3];
        const balanceBefore = await instanceToken.balanceOf(user);

        // Call the stake function
        await instanceStaking.starvingUnstake({from: user});

        const balanceAfter = await instanceToken.balanceOf(user);
        const totalRecovered = BigInt(balanceAfter.toString()) - BigInt(balanceBefore.toString());
        assert.equal(totalRecovered.toString(), AMOUNT, "The total recovered amount should match the principal");

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), rewardsAmount, "The total staked amount should match the rewards amount");

        // Top up the contract with tokens
        await instanceToken.mint(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        
        // Unpause the contract
        await instanceStaking.unpause({from: owner});

        // Await a bit
        await time.increase(time.duration.seconds(1));
        
        // Try normal unstake
        await instanceStaking.unstake({from: user});
        
        // Check the total staked amount
        const totalStaked2 = await instanceStaking.totalStaked();
        assert.equal(totalStaked2.toString(), 0, "The total staked amount should match the staked amount");
    });

    it("Do a second starving unstaking for a user, after contract healthy and successful unstake", async () => {
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked = await instanceStaking.totalStaked();
        assert.equal(totalStaked.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Check the rewards amount and balance before unstaking
        const rewardsAmount = (await instanceStaking.balanceOf(user))[3];
        const balanceBefore = await instanceToken.balanceOf(user);

        // Call the stake function
        await instanceStaking.starvingUnstake({from: user});

        const balanceAfter = await instanceToken.balanceOf(user);
        const totalRecovered = BigInt(balanceAfter.toString()) - BigInt(balanceBefore.toString());
        assert.equal(totalRecovered.toString(), AMOUNT, "The total recovered amount should match the principal");

        // Check the total staked amount
        const totalStaked1 = await instanceStaking.totalStaked();
        assert.equal(totalStaked1.toString(), rewardsAmount, "The total staked amount should match the rewards amount");

        // Top up the contract with tokens
        await instanceToken.mint(instanceStaking.address, web3.utils.toWei(SUPPLY, "ether"), { from: owner });
        
        // Unpause the contract
        await instanceStaking.unpause({from: owner});
        
        // Await a bit
        await time.increase(time.duration.seconds(1));

        // Try normal unstake
        await instanceStaking.unstake({from: user});
        
        // Check the total staked amount
        const totalStaked2 = await instanceStaking.totalStaked();
        assert.equal(totalStaked2.toString(), 0, "The total staked amount should match the staked amount");

        // Withraw the rewards
        await instanceStaking.withdraw({from: owner});

        // Stake again
        await instanceStaking.stake(AMOUNT, { from: user });

        // Check the total staked amount
        const totalStaked3 = await instanceStaking.totalStaked();
        assert.equal(totalStaked3.toString(), AMOUNT, "The total staked amount should match the staked amount");

        // Speed up the time
        await time.increase(time.duration.seconds(120));

        // Check the rewards amount and balance before unstaking
        const rewardsAmount1 = (await instanceStaking.balanceOf(user))[3];
        const balanceBefore1 = await instanceToken.balanceOf(user);

        // Call the stake function
        await instanceStaking.starvingUnstake({from: user});

        const balanceAfter1 = await instanceToken.balanceOf(user);
        const totalRecovered1 = BigInt(balanceAfter1.toString()) - BigInt(balanceBefore1.toString());
        assert.equal(totalRecovered1.toString(), AMOUNT, "The total recovered amount should match the principal");
    });

});

