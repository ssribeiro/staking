import React, { useState, useEffect } from "react";
import Title from "../../atom/title/title";
import NavBar from "../../molecule/navbar/navbar";
import "./home.scss";
import Paragraph from "../../atom/paragraph/paragraph";
import {
    useWeb3ModalProvider,
    useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import * as Web3Service from "../../services/web3.service";
import Input from "../../atom/input/input";
import Button from "../../atom/button/button";
import Footer from "../../molecule/footer/footer";
import Slider from "../../molecule/slider/slider";
import { ApyType } from "../../types/apy.type";
import { BalanceType } from "../../types/balance.type";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function HomePage() {
    /** Wallet provider **/
    const { walletProvider } = useWeb3ModalProvider();

    /** Wallet Address **/
    const { address, isConnected } = useWeb3ModalAccount();

    const [amountTotalStaked, setAmountTotalStaked] = useState<number>(0);
    const [amountTotalStakedPercentage, setAmountTotalStakedPercentage] =
        useState<number>(0);

    const [amountStaked, setAmountStaked] = useState<number>(0);

    const [balance0Month, setBalance0Month] = useState<BalanceType>({
        lockStart: 0,
        lockRemaining: 0,
        balance: 0,
        rewards: 0,
    });

    const [balance1Month, setBalance1Month] = useState<BalanceType>({
        lockStart: 0,
        lockRemaining: 0,
        balance: 0,
        rewards: 0,
    });

    const [balance3Month, setBalance3Month] = useState<BalanceType>({
        lockStart: 0,
        lockRemaining: 0,
        balance: 0,
        rewards: 0,
    });

    const [balance6Month, setBalance6Month] = useState<BalanceType>({
        lockStart: 0,
        lockRemaining: 0,
        balance: 0,
        rewards: 0,
    });

    const [estimatedApy, setEstimatedApy] = useState<number>(0);

    const [listApy, setListApy] = useState<ApyType>({ 0: 0, 1: 0, 3: 0, 6: 0 });

    const [remaining, setRemaining] = useState<number>(0);

    const [rewards, setRewards] = useState<number>(0);

    const [amountAvailable, setAmountAvailable] = useState<number>(0);

    const [amountTvl, setAmountTvl] = useState<number>(0);

    const [valuePeriod, setValuePeriod] = useState<number>(0);

    const [valueToStake, setValueToStake] = useState<string>("0");

    const [valueToUnstake, setValueToUnstake] = useState<number>(0);

    const [isLoadingStake, setIsLoadingStake] = useState<boolean>(false);

    const [isLoadingUnstake, setIsLoadingUnstake] = useState<boolean>(false);

    const [isLoadingClaim, setIsLoadingClaim] = useState<boolean>(false);

    const [refresh, setRefresh] = useState<number>(0);

    const [isMobile, setIsMobile] = useState<boolean>(false);

    const [userStakingTotal, setUserStakingTotal] = useState<number>(0);

    const [userRewardTotal, setUserRewardTotal] = useState<number>(0);

    // const

    /**
     * INIT
     */
    useEffect(() => {
        getBalanceTotal().then((r) => r);
        getApy().then((r) => r);
        setIsMobile(window.screen.width <= 1024);
    }, []);

    /**
     * USE EFFECT TO INIT INFO USER
     */
    useEffect(() => {
        getBalanceTotal().then((r) => r);
        getBalanceToken().then((r) => r);
        getCurrentBalanceStaking().then((r) => r);
    }, [address, valuePeriod]);

    /**
     * USE EFFECT TO INIT INFO USER
     */
    useEffect(() => {
        getBalanceTotal().then((r) => r);
        getBalanceToken().then((r) => r);
        getBalanceStaking().then((r) => r);
        getCurrentBalanceStaking().then((r) => r);
    }, [refresh, isConnected]);

    useEffect(() => {
        setUserStakingTotal(
            balance0Month.balance +
                balance1Month.balance +
                balance3Month.balance +
                balance6Month.balance
        );
        setUserRewardTotal(
            balance0Month.rewards +
                balance1Month.rewards +
                balance3Month.rewards +
                balance6Month.rewards
        );
    }, [balance0Month, balance1Month, balance3Month, balance6Month]);

    /**
     * Refresh the balance and global data
     */
    async function onRefresh() {
        setRefresh(Date.now());
    }

    /**
     * Get the apy
     */
    async function getApy() {
        const apy = await Web3Service.apy(walletProvider, isConnected, address);
        setListApy(apy);
        setEstimatedApy(apy["0"]);
    }

    /**
     * Get total balance
     */
    async function getBalanceTotal() {
        // Set total
        const total0Month = await Web3Service.totalStaking(
            walletProvider,
            isConnected,
            address,
            0
        );
        const total1Month = await Web3Service.totalStaking(
            walletProvider,
            isConnected,
            address,
            1
        );
        const total3Month = await Web3Service.totalStaking(
            walletProvider,
            isConnected,
            address,
            3
        );
        const total6Month = await Web3Service.totalStaking(
            walletProvider,
            isConnected,
            address,
            6
        );

        const total = Web3Service.getAmount(
            total0Month + total1Month + total3Month + total6Month
        );
        setAmountTotalStaked(total);
        setAmountTotalStakedPercentage((total / 761950929.17) * 100);
        setAmountTvl(Number(total) * 0.02851);
    }

    /**
     * Get the current balance
     */
    async function getCurrentBalanceStaking() {
        const balance = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            valuePeriod
        );

        setAmountStaked(Web3Service.getAmount(balance[2]));
        setRewards(Web3Service.getAmount(balance[3]));

        // Period
        const period = Number(balance[1]) / 86400;
        setRemaining(period > 0 ? period : 0); // Seconds to days
    }

    /**
     * Get all balance of the user
     */
    async function getBalanceStaking() {
        const balance0: any = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            0
        );
        setBalance0Month({
            lockStart: balance0.length > 0 ? Number(balance0[0]) : 0,
            lockRemaining: balance0.length > 0 ? Number(balance0[1]) : 0,
            balance:
                balance0.length > 0 ? Web3Service.getAmount(balance0[2]) : 0,
            rewards:
                balance0.length > 0 ? Web3Service.getAmount(balance0[3]) : 0,
        });

        const balance1: any = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            1
        );
        setBalance1Month({
            lockStart: balance1.length > 0 ? Number(balance1[0]) : 0,
            lockRemaining: balance1.length > 0 ? Number(balance1[1]) : 0,
            balance:
                balance1.length > 0 ? Web3Service.getAmount(balance1[2]) : 0,
            rewards:
                balance1.length > 0 ? Web3Service.getAmount(balance1[3]) : 0,
        });

        const balance3: any = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            3
        );
        setBalance3Month({
            lockStart: balance3.length > 0 ? Number(balance3[0]) : 0,
            lockRemaining: balance3.length > 0 ? Number(balance3[1]) : 0,
            balance:
                balance3.length > 0 ? Web3Service.getAmount(balance3[2]) : 0,
            rewards:
                balance3.length > 0 ? Web3Service.getAmount(balance3[3]) : 0,
        });

        const balance6: any = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            6
        );
        setBalance6Month({
            lockStart: balance6.length > 0 ? Number(balance6[0]) : 0,
            lockRemaining: balance3.length > 0 ? Number(balance6[1]) : 0,
            balance:
                balance3.length > 0 ? Web3Service.getAmount(balance6[2]) : 0,
            rewards:
                balance3.length > 0 ? Web3Service.getAmount(balance6[3]) : 0,
        });
    }

    /**
     * Get the balance of available token
     */
    async function getBalanceToken() {
        const balance: any = await Web3Service.balanceToken(
            walletProvider,
            isConnected,
            address
        );
        const amount: any = Web3Service.getAmount(balance);

        setAmountAvailable(amount);
    }

    /**
     * Function to claim rewards
     * @param period The period to unstake
     */
    async function claim(period: number) {
        // Set the loader
        setIsLoadingClaim(true);

        // Stake the tokens
        await Web3Service.claim(walletProvider, isConnected, period);

        // Set the loader && close popup
        setIsLoadingClaim(false);

        // refresh
        await onRefresh();
    }

    /**
     * Function to stake tokens
     */
    async function stake() {
        if (
            Number(valueToStake) <= 0 ||
            Number(valueToStake) >= amountAvailable
        )
            return;

        // Set the loader
        setIsLoadingStake(true);

        // Check if the user has already approved the staking smart contract
        const isApproved = await Web3Service.isApproved(
            walletProvider,
            isConnected,
            address,
            Number(valueToStake),
            valuePeriod
        );

        // Approve the smart contract if it's not already good
        if (!isApproved)
            await Web3Service.approval(
                walletProvider,
                isConnected,
                valuePeriod,
                Number(valueToStake)
            );

        // Stake the tokens
        await Web3Service.stake(
            walletProvider,
            isConnected,
            Number(valueToStake),
            valuePeriod
        );

        // Set the loader && close popup
        setIsLoadingStake(false);
        setValueToStake("0");
        onRefresh();
    }

    /**
     * Function to unstake tokens
     * @param period The period to unstake
     */
    async function unstake(period: number) {
        // Set the loader
        setIsLoadingUnstake(true);

        await Web3Service.unstake(walletProvider, isConnected, period);

        // Set the loader && close popup
        setIsLoadingUnstake(false);
        setValueToUnstake(0);
        onRefresh();
    }

    /**
     * Function when the period value change
     * @param value
     */
    async function onChangePeriodValue(value: number) {
        setValuePeriod(value);
        // @ts-ignore
        setEstimatedApy(listApy[value]);
    }

    /**
     * Function to check value stake
     * @param event
     */
    async function checkValue(event: string) {
        const regex = /^(\d+(\.\d{0,3})?)?$/;
        if (event.match(regex)) {
            setValueToStake(event);
        }
    }

    return (
        <>
            <NavBar />
            <div className={"home-component"}>
                <div className={"home-content"}>
                    <div className={"home-title"}>
                        <Title
                            text={"Stake $OPEN Earn Rewards"}
                            size={"big"}
                            styleFont={"normal"}
                            color={"dark"}
                            weight={"bold"}
                            level={2}
                        />
                    </div>
                    <div className="dashboard">
                        <div className={"content-top"}>
                            <div className={"left"}>
                                <Paragraph
                                    text={"Total $OPEN Staked"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={
                                        String(
                                            amountTotalStaked.toLocaleString(
                                                "en-US",
                                                {
                                                    maximumFractionDigits: 3,
                                                }
                                            )
                                        ) +
                                        " (" +
                                        amountTotalStakedPercentage.toLocaleString(
                                            "en-US",
                                            {
                                                maximumFractionDigits: 2,
                                            }
                                        ) +
                                        "%)"
                                    }
                                    size={"medium"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                                {/* <Paragraph
                                    text={
                                        "Select a locking period to stake your $OPEN and collect rewards.\n" +
                                        "The longer you lock your $OPEN tokens, the bigger your staking APY."
                                    }
                                    size={"medium-3"}
                                    weight={"normal"}
                                    color={"dark"}
                                /> */}
                            </div>
                            {/* <div className={"right"}>
                                <Paragraph
                                    text={"Staked $OPEN"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={String(
                                        amountTotalStaked.toLocaleString(
                                            "en-US",
                                            { maximumFractionDigits: 3 }
                                        )
                                    )}
                                    size={"medium"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div> */}
                        </div>
                        <div className={"content-middle"}>
                            <div className={"left"}>
                                <Slider
                                    onChange={(e: any) =>
                                        onChangePeriodValue(Number(e))
                                    }
                                    max={3}
                                    min={0}
                                    value={valuePeriod}
                                />
                                <ul>
                                    <li>
                                        <Paragraph
                                            text={isMobile ? "0" : "0 Months"}
                                            size={"medium"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                    </li>
                                    <li>
                                        <Paragraph
                                            text={isMobile ? "1" : "1 Month"}
                                            size={"medium"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                    </li>
                                    <li>
                                        <Paragraph
                                            text={isMobile ? "3" : "3 Months"}
                                            size={"medium"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                    </li>
                                    <li>
                                        <Paragraph
                                            text={isMobile ? "6" : "6 Months"}
                                            size={"medium"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div className={"right"}>
                                <div className={"estimated"}>
                                    <Paragraph
                                        text={"Estimated APY"}
                                        size={"medium"}
                                        weight={"normal"}
                                        color={"dark"}
                                    />
                                    <Title
                                        text={`${String(estimatedApy)}%`}
                                        size={"medium"}
                                        styleFont={"normal"}
                                        color={"dark"}
                                        weight={"medium"}
                                        level={4}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={"content-bottom"}>
                            <div className={"left"}>
                                <div className={"staked"}>
                                    <Paragraph
                                        text={"Your Staked $OPEN"}
                                        size={"medium"}
                                        weight={"normal"}
                                        color={"dark"}
                                    />
                                    <Title
                                        text={`${String(
                                            userStakingTotal.toLocaleString(
                                                "en-US",
                                                { maximumFractionDigits: 3 }
                                            )
                                        )}`}
                                        size={"medium"}
                                        styleFont={"normal"}
                                        color={"dark"}
                                        weight={"bold"}
                                        level={4}
                                    />
                                </div>
                            </div>
                            <div className={"middle"}>
                                <Paragraph
                                    text={"Upcoming $OPEN Rewards"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <div className={"amount-claim"}>
                                    <Title
                                        text={`${String(
                                            userRewardTotal.toLocaleString(
                                                "en-US",
                                                { maximumFractionDigits: 3 }
                                            )
                                        )}`}
                                        size={"medium"}
                                        weight={"bold"}
                                        color={"dark"}
                                        level={5}
                                    />
                                </div>
                            </div>
                            <div className={"right"}>

                                {/*<div className={"stake"}>
                                    <Paragraph
                                        text={"Select an amount to Stake:"}
                                        size={"medium"}
                                        weight={"normal"}
                                        color={"dark"}
                                    />
                                    <div className={"amount-stack"}>
                                        <Input
                                            pattern={"\\d+(\\.\\d{1,3})?"}
                                            onChange={(e) =>
                                                checkValue(e.target.value)
                                            }
                                            type={"text"}
                                            style={"input"}
                                            color={"dark"}
                                            value={valueToStake}
                                            name={"stake"}
                                            error={false}
                                        />
                                        <Button
                                            click={() => stake()}
                                            color={"dark"}
                                            styleButton="primary"
                                            text={"Stake"}
                                            disabled={
                                                Number(valueToStake) <= 0 ||
                                                Number(valueToStake) >=
                                                    amountAvailable ||
                                                amountAvailable === 0
                                            }
                                            loading={isLoadingStake}
                                        ></Button>
                                    </div>
                                    <div className={"available"}>
                                        <Paragraph
                                            text={"Available $OPEN Balance:"}
                                            size={"medium-2"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                        <Paragraph
                                            text={String(
                                                amountAvailable.toLocaleString(
                                                    "en-US",
                                                    { maximumFractionDigits: 3 }
                                                )
                                            )}
                                            size={"medium"}
                                            weight={"bold"}
                                            color={"dark"}
                                        />
                                    </div>
                                </div>*/}
                            </div>
                        </div>
                    </div>
                    <div className="dashboard">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <Paragraph
                                            text={"Staked Amount"}
                                            weight={"normal"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </th>
                                    <th>
                                        <Paragraph
                                            text={"Rewards"}
                                            weight={"normal"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </th>
                                    <th>
                                        <Paragraph
                                            text={"Start Date"}
                                            weight={"normal"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </th>
                                    <th>
                                        <Paragraph
                                            text={"Duration"}
                                            weight={"normal"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </th>
                                    <th>
                                        <Paragraph
                                            text={"Release Date"}
                                            weight={"normal"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </th>
                                    <th>
                                        <Paragraph
                                            text={"Estimated APY"}
                                            weight={"normal"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key={0}>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance0Month.balance.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance0Month.rewards.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance0Month.lockStart > 0
                                                    ? dayjs
                                                          .unix(
                                                              balance0Month.lockStart
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY HH:mm"
                                                          )
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={"0 Month"}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={"Anytime"}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={`${listApy[0]}%`}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <div className={"btn-unstake"}>
                                            <Button
                                                click={() =>
                                                    unstake(
                                                        0
                                                    )
                                                }
                                                color={"light"}
                                                styleButton="primary"
                                                loading={isLoadingUnstake}
                                                disabled={
                                                    !isConnected ||
                                                    balance0Month.lockRemaining /
                                                        86400 >
                                                        0 ||
                                                    balance0Month.balance === 0
                                                }
                                                text={"Unstake"}
                                            ></Button>
                                            {/*
                                            <Button
                                                click={() => claim(0)}
                                                color={"dark"}
                                                styleButton="primary"
                                                loading={isLoadingClaim}
                                                disabled={
                                                    balance0Month.rewards <= 0
                                                }
                                                text={"Claim"}
                                            ></Button>
                                            */}
                                        </div>
                                    </td>
                                </tr>
                                <tr key={1}>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance1Month.balance.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance1Month.rewards.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance1Month.lockStart > 0
                                                    ? dayjs
                                                          .unix(
                                                              balance1Month.lockStart
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY"
                                                          )
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={"1 Month"}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance1Month.lockStart > 0
                                                    ? `${dayjs()
                                                          .add(
                                                              balance1Month.lockRemaining,
                                                              "second"
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY"
                                                          )}`
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={`${listApy[1]}%`}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <div className={"btn-unstake"}>
                                            <Button
                                                click={() =>
                                                    unstake(
                                                        1
                                                    )
                                                }
                                                color={"light"}
                                                styleButton="primary"
                                                loading={isLoadingUnstake}
                                                disabled={
                                                    !isConnected ||
                                                    balance1Month.lockRemaining /
                                                        86400 >
                                                        0 ||
                                                    balance1Month.balance === 0
                                                }
                                                text={"Unstake"}
                                            ></Button>
                                            {/*
                                            <Button
                                                click={() => claim(1)}
                                                color={"dark"}
                                                styleButton="primary"
                                                loading={isLoadingClaim}
                                                disabled={
                                                    balance1Month.rewards <= 0
                                                }
                                                text={"Claim"}
                                            ></Button>
                                            */}
                                        </div>
                                    </td>
                                </tr>
                                <tr key={3}>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance3Month.balance.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance3Month.rewards.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance3Month.lockStart > 0
                                                    ? dayjs
                                                          .unix(
                                                              balance3Month.lockStart
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY"
                                                          )
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={"3 Months"}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance3Month.lockStart > 0
                                                    ? `${dayjs()
                                                          .add(
                                                              balance3Month.lockRemaining,
                                                              "second"
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY"
                                                          )}`
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={`${listApy[3]}%`}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <div className={"btn-unstake"}>
                                            <Button
                                                click={() =>
                                                    unstake(
                                                        3
                                                    )
                                                }
                                                color={"light"}
                                                styleButton="primary"
                                                loading={isLoadingUnstake}
                                                disabled={
                                                    !isConnected ||
                                                    balance3Month.lockRemaining /
                                                        86400 >
                                                        0 ||
                                                    balance3Month.balance === 0
                                                }
                                                text={"Unstake"}
                                            ></Button>
                                            {/*
                                            <Button
                                                click={() => claim(3)}
                                                color={"dark"}
                                                styleButton="primary"
                                                loading={isLoadingClaim}
                                                disabled={
                                                    balance3Month.rewards <= 0
                                                }
                                                text={"Claim"}
                                            ></Button>
                                            */}
                                        </div>
                                    </td>
                                </tr>
                                <tr key={6}>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance6Month.balance.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                String(
                                                    balance6Month.rewards.toLocaleString(
                                                        "en-US",
                                                        {
                                                            maximumFractionDigits: 3,
                                                        }
                                                    )
                                                ) + " $OPEN"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance6Month.lockStart > 0
                                                    ? dayjs
                                                          .unix(
                                                              balance6Month.lockStart
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY"
                                                          )
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={"6 Months"}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={
                                                balance6Month.lockStart > 0
                                                    ? `${dayjs()
                                                          .add(
                                                              balance6Month.lockRemaining,
                                                              "second"
                                                          )
                                                          .format(
                                                              "MMM, DD YYYY"
                                                          )}`
                                                    : "-"
                                            }
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <Paragraph
                                            text={`${listApy[6]}%`}
                                            weight={"bold"}
                                            color={"dark"}
                                            size={"medium-3"}
                                        />
                                    </td>
                                    <td>
                                        <div className={"btn-unstake"}>
                                            <Button
                                                click={() =>
                                                    unstake(
                                                        6
                                                    ) ||
                                                    balance6Month.balance === 0
                                                }
                                                color={"light"}
                                                styleButton="primary"
                                                loading={isLoadingUnstake}
                                                disabled={
                                                    !isConnected ||
                                                    balance6Month.lockRemaining /
                                                        86400 >
                                                        0 ||
                                                    balance6Month.balance === 0
                                                }
                                                text={"Unstake"}
                                            ></Button>
                                            {/*
                                            <Button
                                                click={() => claim(6)}
                                                color={"dark"}
                                                styleButton="primary"
                                                loading={isLoadingClaim}
                                                disabled={
                                                    balance6Month.rewards <= 0
                                                }
                                                text={"Claim"}
                                            ></Button>
                                            */}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default HomePage;
