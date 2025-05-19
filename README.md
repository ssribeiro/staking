# OPEN Staking (with Contract V2 changes)

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

Why Contract V2 Is Safer
This second version is safer for users, as there is no condition that can permanently lock a user’s principal. Trust in this contract requires zero risk to the user’s core funds. The only trust required is that admins maintain a fair APY.

## Overview (Copy from original README)

OPEN Staking, our trustless staking platform is designed to let users stake and lock their tokens according to their individual preferences through smart contracts, and a dapp frontend dashboard to participate in a simple way.

This fork repository contains the original frontend and contracts code as well as the contract v2. 

To access OPEN Staking please visit https://staking.opencustody.org

For more information and user guides please visit our [docs site]([url](https://docs.opencustody.org/staking-guide))

## Staking Contracts Information (V1 only)
First OPEN Staking contracts are deployed on Ethereum blockchain
| Contract | Contract Address |
|--|--|
| 0 months | 0xE28c1a85268B081CbaeA8B71e3464E132aA8a0d4 |
| 1 month | 0xeC8FC8F622d5dA70162285FA76e896AB403BF1B3 |
| 3 months |0xc8fee8f78aBC7ba5fF314091Dc64240Bdd36b794 |
| 6 months | 0x5E5A1Ee6BeA02D24B19C322006614902ED638Ba5 |
