import { useState, useEffect } from "react";
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
// import Slider from "../../molecule/slider/slider";
// import { ApyType } from "../../types/apy.type";
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
    const [amountTotalStakedOCP, setAmountTotalStakedOCP] = useState<number>(0);

    const [amountTotalStakedPercentage, setAmountTotalStakedPercentage] =
        useState<number>(0);
    const [amountTotalStakedPercentageOCP, setAmountTotalStakedPercentageOCP] =
        useState<number>(0);

    const [amountStaked, setAmountStaked] = useState<number>(0);
    const [amountStakedOCP, setAmountStakedOCP] = useState<number>(0);

    const [balance, setBalance] = useState<BalanceType>({
        lockStart: 0,
        lockRemaining: 0,
        balance: 0,
        rewards: 0,
    });
    const [balanceOCP, setBalanceOCP] = useState<BalanceType>({
        lockStart: 0,
        lockRemaining: 0,
        balance: 0,
        rewards: 0,
    });

    // const [estimatedApy, setEstimatedApy] = useState<number>(0);

    // const [listApy, setListApy] = useState<ApyType>({ 0: 0, 1: 0, 3: 0, 6: 0 });

    const [remaining, setRemaining] = useState<number>(0);
    const [remainingOCP, setRemainingOCP] = useState<number>(0);

    const [rewards, setRewards] = useState<number>(0);
    const [rewardsOCP, setRewardsOCP] = useState<number>(0);

    const [amountAvailable, setAmountAvailable] = useState<number>(0);
    const [amountAvailableOCP, setAmountAvailableOCP] = useState<number>(0);

    const [amountTvl, setAmountTvl] = useState<number>(0);
    const [amountTvlOCP, setAmountTvlOCP] = useState<number>(0);

    const [valuePeriod, setValuePeriod] = useState<number>(0);
    const [valuePeriodOCP, setValuePeriodOCP] = useState<number>(0);

    const [valueToStake, setValueToStake] = useState<string>("0");
    const [valueToStakeOCP, setValueToStakeOCP] = useState<string>("0");

    const [valueToUnstake, setValueToUnstake] = useState<number>(0);
    const [valueToUnstakeOCP, setValueToUnstakeOCP] = useState<number>(0);

    const [isLoadingStake, setIsLoadingStake] = useState<boolean>(false);
    const [isLoadingStakeOCP, setIsLoadingStakeOCP] = useState<boolean>(false);

    const [isLoadingUnstake, setIsLoadingUnstake] = useState<boolean>(false);
    const [isLoadingUnstakeOCP, setIsLoadingUnstakeOCP] =
        useState<boolean>(false);

    const [isLoadingClaim, setIsLoadingClaim] = useState<boolean>(false);
    const [isLoadingClaimOCP, setIsLoadingClaimOCP] = useState<boolean>(false);

    const [refresh, setRefresh] = useState<number>(0);

    const [isMobile, setIsMobile] = useState<boolean>(false);

    const [userStakingTotal, setUserStakingTotal] = useState<number>(0);
    const [userStakingOCPTotal, setUserStakingOCPTotal] = useState<number>(0);

    const [userRewardTotal, setUserRewardTotal] = useState<number>(0);
    const [userRewardOCPTotal, setUserRewardOCPTotal] = useState<number>(0);

    // const

    /**
     * INIT
     */
    useEffect(() => {
        getBalanceTotal().then((r) => r);
        // getApy().then((r) => r);
        setIsMobile(window.screen.width <= 1024);
    }, []);

    /**
     * USE EFFECT TO INIT INFO USER
     */
    useEffect(() => {
        getBalanceTotal().then((r) => r);
        getBalanceToken().then((r) => r);
        getBalanceOCPToken().then((r) => r);
        getCurrentBalanceStaking().then((r) => r);
    }, [address, valuePeriod]);

    /**
     * USE EFFECT TO INIT INFO USER
     */
    useEffect(() => {
        getBalanceTotal().then((r) => r);
        getBalanceToken().then((r) => r);
        getBalanceOCPToken().then((r) => r);
        getBalanceStaking().then((r) => r);
        getCurrentBalanceStaking().then((r) => r);
    }, [refresh, isConnected]);

    useEffect(() => {
        setUserStakingTotal(balance.balance);
        setUserRewardTotal(balance.rewards);
        setUserStakingOCPTotal(balanceOCP.balance);
        setUserRewardOCPTotal(balanceOCP.rewards);
    }, [balance, balanceOCP]);

    /**
     * Refresh the balance and global data
     */
    async function onRefresh() {
        setRefresh(Date.now());
    }

    /**
     * Get total balance
     */
    async function getBalanceTotal() {
        // Set total
        const totalOPEN = await Web3Service.totalStaking(
            walletProvider,
            isConnected,
            address,
            "OPEN"
        );

        const totalOCP = await Web3Service.totalStaking(
            walletProvider,
            isConnected,
            address,
            "OCP"
        );

        const totalOPENAmount = Web3Service.getAmount(totalOPEN);
        const totalOCPAmount = Web3Service.getAmount(totalOCP);

        setAmountTotalStaked(totalOPENAmount);
        setAmountTotalStakedPercentage((totalOPENAmount / 761950929.17) * 100);
        setAmountTvl(Number(totalOPENAmount) * 0.02851);

        setAmountTotalStakedOCP(totalOCPAmount);
        setAmountTotalStakedPercentageOCP(
            (totalOCPAmount / 761950929.17) * 100
        );
        setAmountTvlOCP(Number(totalOCPAmount) * 0.02851);
    }

    /**
     * Get the current balance
     */
    async function getCurrentBalanceStaking() {
        const balance = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            "OPEN"
        );

        setAmountStaked(Web3Service.getAmount(balance[2]));
        setRewards(Web3Service.getAmount(balance[3]));

        // Period
        const period = Number(balance[1]) / 86400;
        setRemaining(period > 0 ? period : 0); // Seconds to days

        // OCP
        const balanceOCP = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            "OCP"
        );

        setAmountStakedOCP(Web3Service.getAmount(balanceOCP[2]));
        setRewardsOCP(Web3Service.getAmount(balanceOCP[3]));

        // Period
        const periodOCP = Number(balanceOCP[1]) / 86400;
        setRemainingOCP(periodOCP > 0 ? periodOCP : 0); // Seconds to days
    }

    /**
     * Get all balance of the user
     */
    async function getBalanceStaking() {
        const balance: any = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            "OPEN"
        );
        setBalance({
            lockStart: balance.length > 0 ? Number(balance[0]) : 0,
            lockRemaining: balance.length > 0 ? Number(balance[1]) : 0,
            balance: balance.length > 0 ? Web3Service.getAmount(balance[2]) : 0,
            rewards: balance.length > 0 ? Web3Service.getAmount(balance[3]) : 0,
        });

        const balanceOCP: any = await Web3Service.balanceStaking(
            walletProvider,
            isConnected,
            address,
            "OCP"
        );
        setBalanceOCP({
            lockStart: balanceOCP.length > 0 ? Number(balanceOCP[0]) : 0,
            lockRemaining: balanceOCP.length > 0 ? Number(balanceOCP[1]) : 0,
            balance:
                balanceOCP.length > 0
                    ? Web3Service.getAmount(balanceOCP[2])
                    : 0,
            rewards:
                balanceOCP.length > 0
                    ? Web3Service.getAmount(balanceOCP[3])
                    : 0,
        });
    }

    /**
     * Get the balance of available open token
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
     * Get the balance of available ocp token
     */
    async function getBalanceOCPToken() {
        const balance: any = await Web3Service.balanceOCPToken(
            walletProvider,
            isConnected,
            address
        );
        const amount: any = Web3Service.getOCPAmount(balance);

        setAmountAvailableOCP(amount);
    }

    /**
     * Function to claim OPEN rewards
     * @param period The period to unstake
     */
    async function claim() {
        // Set the loader
        setIsLoadingClaim(true);

        // Stake the tokens
        await Web3Service.claim(walletProvider, isConnected);

        // Set the loader && close popup
        setIsLoadingClaim(false);

        // refresh
        await onRefresh();
    }

    /**
     * Function to claim OPEN rewards
     * @param period The period to unstake
     */
    async function claimOCP() {
        // Set the loader
        setIsLoadingClaimOCP(true);

        // Stake the tokens
        await Web3Service.claimOCP(walletProvider, isConnected);

        // Set the loader && close popup
        setIsLoadingClaimOCP(false);

        // refresh
        await onRefresh();
    }

    /**
     * Function to stake OPEN tokens
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
            Number(valueToStake)
        );

        // Approve the smart contract if it's not already good
        if (!isApproved)
            await Web3Service.approval(
                walletProvider,
                isConnected,
                Number(valueToStake)
            );

        // Stake the tokens
        await Web3Service.stake(
            walletProvider,
            isConnected,
            Number(valueToStake)
        );

        // Set the loader && close popup
        setIsLoadingStake(false);
        setValueToStake("0");
        onRefresh();
    }

    /**
     * Function to stake OCP tokens
     */
    async function stakeOCP() {
        if (
            Number(valueToStakeOCP) <= 0 ||
            Number(valueToStakeOCP) >= amountAvailableOCP
        )
            return;

        // Set the loader
        setIsLoadingStakeOCP(true);

        // Check if the user has already approved the staking smart contract
        const isApproved = await Web3Service.isApprovedOCP(
            walletProvider,
            isConnected,
            address,
            Number(valueToStakeOCP)
        );

        // Approve the smart contract if it's not already good
        if (!isApproved)
            await Web3Service.approvalOCP(
                walletProvider,
                isConnected,
                Number(valueToStakeOCP)
            );

        // Stake the tokens
        await Web3Service.stakeOCP(
            walletProvider,
            isConnected,
            Number(valueToStakeOCP)
        );

        // Set the loader && close popup
        setIsLoadingStakeOCP(false);
        setValueToStakeOCP("0");
        onRefresh();
    }

    /**
     * Function to unstake OPEN tokens
     * @param period The period to unstake
     */
    async function unstake() {
        // Set the loader
        setIsLoadingUnstake(true);

        await Web3Service.unstake(walletProvider, isConnected);

        // Set the loader && close popup
        setIsLoadingUnstake(false);
        setValueToUnstake(0);
        onRefresh();
    }

    /**
     * Function to unstake OCP tokens
     * @param period The period to unstake
     */
    async function unstakeOCP() {
        // Set the loader
        setIsLoadingUnstakeOCP(true);

        await Web3Service.unstakeOCP(walletProvider, isConnected);

        // Set the loader && close popup
        setIsLoadingUnstakeOCP(false);
        setValueToUnstakeOCP(0);
        onRefresh();
    }

    /**
     * Function to check value stake OPEN
     * @param event
     */
    async function checkValue(event: string) {
        const regex = /^(\d+(\.\d{0,3})?)?$/;
        if (event.match(regex)) {
            setValueToStake(event);
        }
    }

    /**
     * Function to check value stake OCP
     * @param event
     */
    async function checkValueOCP(event: string) {
        const regex = /^(\d+(\.\d{0,3})?)?$/;
        if (event.match(regex)) {
            setValueToStakeOCP(event);
        }
    }

    return (
        <>
            <NavBar />
            <div className={"home-component"}>
                <div className={"home-content"}>
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
                            </div>
                        </div>
                        <div className={"content-middle"}>
                            <div className={"estimated"}>
                                <Paragraph
                                    text={"Estimated APY"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={"40%"}
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                            <div className={"duration"}>
                                <Paragraph
                                    text={"Duration"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={"1 month"}
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                            <div className={"start-date"}>
                                <Paragraph
                                    text={"Start Date"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={
                                        balance.lockStart > 0
                                            ? dayjs
                                                  .unix(balance.lockStart)
                                                  .format("MMM, DD YYYY")
                                            : "-"
                                    }
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                            <div className={"release-date"}>
                                <Paragraph
                                    text={"Release Date"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={
                                        balance.lockStart > 0
                                            ? `${dayjs()
                                                  .add(
                                                      balance.lockRemaining,
                                                      "second"
                                                  )
                                                  .format("MMM, DD YYYY")}`
                                            : "-"
                                    }
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                        </div>
                        <div className={"content-bottom"}>
                            <div className={"left"}>
                                <div>
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
                                <div className={"unstake-button"}>
                                    <Button
                                        click={() => unstake()}
                                        color={"dark"}
                                        styleButton="primary"
                                        loading={isLoadingUnstake}
                                        disabled={
                                            !isConnected ||
                                            balance.lockRemaining / 86400 > 0 ||
                                            balance.balance === 0
                                        }
                                        text={"Unstake"}
                                    ></Button>
                                </div>
                            </div>
                            <div className={"middle"}>
                                <div>
                                    <Paragraph
                                        text={"$OPEN Rewards"}
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
                                <div className={"claim-button"}>
                                    <Button
                                        click={() => claim()}
                                        color={"dark"}
                                        styleButton="primary"
                                        loading={isLoadingClaim}
                                        disabled={balance.rewards <= 0}
                                        text={"Claim"}
                                    ></Button>
                                </div>
                            </div>
                            <div className={"right"}>
                                <div className={"stake"}>
                                    <div className={"available"}>
                                        <Paragraph
                                            text={"Available $OPEN Balance:"}
                                            size={"medium"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                        <Paragraph
                                            text={String(
                                                amountAvailable.toLocaleString(
                                                    "en-US",
                                                    {
                                                        maximumFractionDigits: 3,
                                                    }
                                                )
                                            )}
                                            size={"medium"}
                                            weight={"bold"}
                                            color={"dark"}
                                        />
                                    </div>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard">
                        <div className={"content-top"}>
                            <div className={"left"}>
                                <Paragraph
                                    text={"Total $OCP Staked"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={
                                        String(
                                            amountTotalStakedOCP.toLocaleString(
                                                "en-US",
                                                {
                                                    maximumFractionDigits: 3,
                                                }
                                            )
                                        ) +
                                        " (" +
                                        amountTotalStakedPercentageOCP.toLocaleString(
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
                            </div>
                        </div>
                        <div className={"content-middle"}>
                            <div className={"estimated"}>
                                <Paragraph
                                    text={"Estimated APY"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={"40%"}
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                            <div className={"duration"}>
                                <Paragraph
                                    text={"Duration"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={"1 month"}
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                            <div className={"start-date"}>
                                <Paragraph
                                    text={"Start Date"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={
                                        balanceOCP.lockStart > 0
                                            ? dayjs
                                                  .unix(balanceOCP.lockStart)
                                                  .format("MMM, DD YYYY")
                                            : "-"
                                    }
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                            <div className={"release-date"}>
                                <Paragraph
                                    text={"Release Date"}
                                    size={"medium"}
                                    weight={"normal"}
                                    color={"dark"}
                                />
                                <Title
                                    text={
                                        balanceOCP.lockStart > 0
                                            ? `${dayjs()
                                                  .add(
                                                      balanceOCP.lockRemaining,
                                                      "second"
                                                  )
                                                  .format("MMM, DD YYYY")}`
                                            : "-"
                                    }
                                    size={"small"}
                                    styleFont={"normal"}
                                    color={"dark"}
                                    weight={"bold"}
                                    level={4}
                                />
                            </div>
                        </div>
                        <div className={"content-bottom"}>
                            <div className={"left"}>
                                <div>
                                    <Paragraph
                                        text={"Your Staked $OCP"}
                                        size={"medium"}
                                        weight={"normal"}
                                        color={"dark"}
                                    />
                                    <Title
                                        text={`${String(
                                            userStakingOCPTotal.toLocaleString(
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
                                <div className={"unstake-button"}>
                                    <Button
                                        click={() => unstakeOCP()}
                                        color={"dark"}
                                        styleButton="primary"
                                        loading={isLoadingUnstakeOCP}
                                        disabled={
                                            !isConnected ||
                                            balanceOCP.lockRemaining / 86400 >
                                                0 ||
                                            balanceOCP.balance === 0
                                        }
                                        text={"Unstake"}
                                    ></Button>
                                </div>
                            </div>
                            <div className={"middle"}>
                                <div>
                                    <Paragraph
                                        text={"$OCP Rewards"}
                                        size={"medium"}
                                        weight={"normal"}
                                        color={"dark"}
                                    />
                                    <div className={"amount-claim"}>
                                        <Title
                                            text={`${String(
                                                userRewardOCPTotal.toLocaleString(
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
                                <div className={"claim-button"}>
                                    <Button
                                        click={() => claimOCP()}
                                        color={"dark"}
                                        styleButton="primary"
                                        loading={isLoadingClaimOCP}
                                        disabled={balanceOCP.rewards <= 0}
                                        text={"Claim"}
                                    ></Button>
                                </div>
                            </div>
                            <div className={"right"}>
                                <div className={"stake"}>
                                    <div className={"available"}>
                                        <Paragraph
                                            text={"Available $OCP Balance:"}
                                            size={"medium"}
                                            weight={"normal"}
                                            color={"dark"}
                                        />
                                        <Paragraph
                                            text={String(
                                                amountAvailableOCP.toLocaleString(
                                                    "en-US",
                                                    { maximumFractionDigits: 3 }
                                                )
                                            )}
                                            size={"medium"}
                                            weight={"bold"}
                                            color={"dark"}
                                        />
                                    </div>
                                    <div className={"amount-stack"}>
                                        <Input
                                            pattern={"\\d+(\\.\\d{1,3})?"}
                                            onChange={(e) =>
                                                checkValueOCP(e.target.value)
                                            }
                                            type={"text"}
                                            style={"input"}
                                            color={"dark"}
                                            value={valueToStakeOCP}
                                            name={"stake"}
                                            error={false}
                                        />
                                        <Button
                                            click={() => stakeOCP()}
                                            color={"dark"}
                                            styleButton="primary"
                                            text={"Stake"}
                                            disabled={
                                                Number(valueToStakeOCP) <= 0 ||
                                                Number(valueToStakeOCP) >=
                                                    amountAvailableOCP ||
                                                amountAvailableOCP === 0
                                            }
                                            loading={isLoadingStakeOCP}
                                        ></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default HomePage;
