## Contract V2 – Additional Features
Admins cannot pause the contract for unstaking; they can only pause it to prevent new stakes.

Admins are prohibited from modifying the lock period of past stakes. New lock periods will apply only to new staking actions.

A promotional lock period can be applied retroactively, but only if it benefits the user.
(Example: If a user staked for 3 months, and a 1-month promotional lock is introduced, the user’s lock period can be reduced to 1 month—but never extended to a longer period like 6 months.)

If the contract runs out of reward tokens, it will no longer lock users’ funds as the original contract did. Instead, it enables a mechanism called “Starving Unstake.”

## Starving Unstake
Each user is allowed one Starving Unstake per starvation period.

It allows the user to unstake their principal only, while automatically restaking the rewards to be claimed once the contract is replenished and healthy again.

A single Starving Unstake will trigger the starvation mode, pausing the contract to prevent new stakes.

Starvation mode ensures that users can only stake when the contract is healthy and capable of paying rewards. Admins must top up the contract before they can unpause staking.

Once the contract is healthy again and the user either unstakes or stakes more, they regain the ability to perform another Starving Unstake in any future starvation period.

Why Contract V2 Is Safer:

This second version is safer for users, as there is no condition that can permanently lock a user’s principal. Trust in this contract requires zero risk to the user’s core funds. The only trust required is that admins maintain a fair APY.

# Testing of the smart contract

The smart contract testing use truffle as testing framework and ganache as a test blockchain.

## Files
```
contracts
    |   
    |- Staking.sol // Staking smart contract
    |- Token.sol // Dummy ERC-20 smart contract (testing purpose)

test
    | 
    |- 1_basic.js // Focus on the basic struff, such as set lock, set APY etc.
    |- 2_stake.js // Focus on the stake functionnality
    |- 3_rewards.js // Focus on the rewards functionnality
    |- 4_rewards.js // Focus on the rewards functionnality
    |- 5_unstake.js // Focus on the unstake functionnality
```

## Installation
### Install Truffle & Ganache
Before using Truffle & Ganache, you need to have Node.Js v20.

    > npm install -g truffle
    > npm install -g ganache


### Install the project
At the root of the project, run:

    > npm install

## Compile smart contract
Truffle use solc to compile smart contract.

    > truffle compile

## Testing
You can find all the test file in `/test`. Each file is autonomous, set-up the staking smart contract and the token smart contract before doing different cases.

You can run the test using Truffle, doing so you need to start ganache, the local blockchain and then start truffle to launch every tests.

First, start Ganache in one terminal:
    
    // Should run a RPC at 127.0.0.1:8545
    > ganache

In a second terminal, launch the test suite:

    > truffle test                      // Run every test 
    > truffle test ./test/1_basic.js    // Run a specific test


## Code Coverage
Test coverage will create a folder `coverage` with the html detail and also a `coverage.json`

    >  truffle run coverage
