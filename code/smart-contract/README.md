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
