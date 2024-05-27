import * as ethers from 'ethers';
import {
    SMART_CONTRACT_STAKING_0_MONTH,
    SMART_CONTRACT_STAKING_1_MONTH,
    SMART_CONTRACT_STAKING_3_MONTH,
    SMART_CONTRACT_STAKING_6_MONTH,
    SMART_CONTRACT_TOKEN,
    WALLET_CONNECT_NETWORK,
    NETWORK
} from "../constants/constants";
import { notification } from "./notification.service";
import { ApyType } from "../types/apy.type";


/**
 * Function to get the right amount, based on the decimals
 */
export function getAmount(amount: any, decimal: BigInt = 1000n) : number {
    if (amount === undefined) return 0;

    // @ts-ignore
    return Number(BigInt(amount) * decimal / BigInt(10**SMART_CONTRACT_TOKEN.decimals)) / 1000;
}

/**
 * Function to get apy
 */
export async function apy(walletProvider: any, isConnected: boolean, address: any) : Promise<ApyType> {
    let provider: any = null;
    let signer: any = null;

    if (isConnected) {
        provider = new ethers.BrowserProvider(walletProvider);
        signer = await provider.getSigner();
    }
    else {
        provider = new ethers.JsonRpcProvider(WALLET_CONNECT_NETWORK[NETWORK].rpcUrl);
        signer = provider;
    }

    // Init smart contract
    const contract1 = new ethers.Contract(SMART_CONTRACT_STAKING_0_MONTH.address, SMART_CONTRACT_STAKING_0_MONTH.abi, signer);
    const contract2 = new ethers.Contract(SMART_CONTRACT_STAKING_1_MONTH.address, SMART_CONTRACT_STAKING_1_MONTH.abi, signer);
    const contract3 = new ethers.Contract(SMART_CONTRACT_STAKING_3_MONTH.address, SMART_CONTRACT_STAKING_3_MONTH.abi, signer);
    const contract4 = new ethers.Contract(SMART_CONTRACT_STAKING_6_MONTH.address, SMART_CONTRACT_STAKING_6_MONTH.abi, signer);

    return {
        "0": await contract1.apy(),
        "1": await contract2.apy(),
        "3": await contract3.apy(),
        "6": await contract4.apy(),
    }
}

/**
 * Function to get user balance
 */
export async function totalStaking(walletProvider: any, isConnected: boolean, address: any, period: number) : Promise<number> {
    let provider: any = null;
    let signer: any = null;

    if (isConnected) {
        provider = new ethers.BrowserProvider(walletProvider);
        signer = await provider.getSigner();
    }
    else {
        provider = new ethers.JsonRpcProvider(WALLET_CONNECT_NETWORK[NETWORK].rpcUrl);
        signer = provider;
    }

    switch (period) {
        case 0:
            const contract = new ethers.Contract(SMART_CONTRACT_STAKING_0_MONTH.address, SMART_CONTRACT_STAKING_0_MONTH.abi, signer);
            return await contract.totalStaked();
        case 1:
            const contract1 = new ethers.Contract(SMART_CONTRACT_STAKING_1_MONTH.address, SMART_CONTRACT_STAKING_1_MONTH.abi, signer);
            return await contract1.totalStaked();
        case 3:
            const contract2 = new ethers.Contract(SMART_CONTRACT_STAKING_3_MONTH.address, SMART_CONTRACT_STAKING_3_MONTH.abi, signer);
            return await contract2.totalStaked();
        case 6:
            const contract3 = new ethers.Contract(SMART_CONTRACT_STAKING_6_MONTH.address, SMART_CONTRACT_STAKING_6_MONTH.abi, signer);
            return await contract3.totalStaked();
    }

    return 0;
}

/**
 * Function to get user balance
 */
export async function balanceStaking(walletProvider: any, isConnected: boolean, address: any, period: number) : Promise<Array<any>> {
    if (isConnected === false) return [];

    // Init smart contract
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();

    switch (period) {
        case 0:
            const contract = new ethers.Contract(SMART_CONTRACT_STAKING_0_MONTH.address, SMART_CONTRACT_STAKING_0_MONTH.abi, signer);
            return await contract.balanceOf(address);
        case 1:
            const contract1 = new ethers.Contract(SMART_CONTRACT_STAKING_1_MONTH.address, SMART_CONTRACT_STAKING_1_MONTH.abi, signer);
            return await contract1.balanceOf(address);
        case 3:
            const contract2 = new ethers.Contract(SMART_CONTRACT_STAKING_3_MONTH.address, SMART_CONTRACT_STAKING_3_MONTH.abi, signer);
            return await contract2.balanceOf(address);
        case 6:
            const contract3 = new ethers.Contract(SMART_CONTRACT_STAKING_6_MONTH.address, SMART_CONTRACT_STAKING_6_MONTH.abi, signer);
            return await contract3.balanceOf(address);
    }

    return [];
}

/**
 * Function to get user balance
 */
export async function balanceToken(walletProvider: any, isConnected: boolean, address: any) : Promise<number> {
    if (isConnected === false) return 0;

    // Init smart contract
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(SMART_CONTRACT_TOKEN.address, SMART_CONTRACT_TOKEN.abi, signer);

    return await contract.balanceOf(address);
}

/**
 * Function to approve the staking smart contract
 */
export async function approval(walletProvider: any, isConnected: boolean, period: number, max: number) : Promise<boolean> {
    if (isConnected === false) return false;

    let smartContractAddress = "";
    switch (period) {
        case 0:
            smartContractAddress = SMART_CONTRACT_STAKING_0_MONTH.address;
            break;
        case 1:
            smartContractAddress = SMART_CONTRACT_STAKING_1_MONTH.address;
            break;
        case 3:
            smartContractAddress = SMART_CONTRACT_STAKING_3_MONTH.address;
            break;
        case 6:
            smartContractAddress = SMART_CONTRACT_STAKING_6_MONTH.address;
            break;
    }

    try {
        // Init smart contract
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(SMART_CONTRACT_TOKEN.address, SMART_CONTRACT_TOKEN.abi, signer);

        const decimals = SMART_CONTRACT_TOKEN.decimals;
        const tx = await contract.approve(smartContractAddress, BigInt(max * (10**decimals)), {
            gasLimit: 250000, // Set an appropriate gas limit
        });
        const transaction = await tx.wait();
        console.log('TRANSACTION', transaction);

        notification('success', 'Success! You can check the', `${WALLET_CONNECT_NETWORK[NETWORK].explorerUrl}/tx/${tx.hash}`, 'transaction here');

        return true;
    } catch (e) {
        notification('error', 'An unexpected error occured, please try again later', '', '');
        console.log(e);
    }

    return false;
}

/**
 * Function to check if the smart contract is approved
 */
export async function isApproved(walletProvider: any, isConnected: boolean, address: any, amount: number, period: number) : Promise<boolean> {
    if (isConnected === false) return false;

    let smartContractAddress = "";
    switch (period) {
        case 0:
            smartContractAddress = SMART_CONTRACT_STAKING_0_MONTH.address;
            break;
        case 1:
            smartContractAddress = SMART_CONTRACT_STAKING_1_MONTH.address;
            break;
        case 3:
            smartContractAddress = SMART_CONTRACT_STAKING_3_MONTH.address;
            break;
        case 6:
            smartContractAddress = SMART_CONTRACT_STAKING_6_MONTH.address;
            break;
    }

    // Init smart contract
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(SMART_CONTRACT_TOKEN.address, SMART_CONTRACT_TOKEN.abi, signer);

    const amountAllowed = await contract.allowance(address, smartContractAddress);
    const decimals = SMART_CONTRACT_TOKEN.decimals;
    const amountRequested = BigInt(amount * (10**decimals));

    return amountAllowed >= amountRequested;
}

/**
 * Function to stake token
 */
export async function stake(walletProvider: any, isConnected: boolean, amount: any, period: number) : Promise<boolean> {
    if (isConnected === false) return false;

    let smartContractAddress: string = "";
    let smartContractAbi: Array<any> = [];
    switch (period) {
        case 0:
            smartContractAddress = SMART_CONTRACT_STAKING_0_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_0_MONTH.abi;
            break;
        case 1:
            smartContractAddress = SMART_CONTRACT_STAKING_1_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_1_MONTH.abi;
            break;
        case 3:
            smartContractAddress = SMART_CONTRACT_STAKING_3_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_3_MONTH.abi;
            break;
        case 6:
            smartContractAddress = SMART_CONTRACT_STAKING_6_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_6_MONTH.abi;
            break;
    }

    try {
        // Init smart contract
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contractStaking = new ethers.Contract(smartContractAddress, smartContractAbi, signer);

        // Get the decimals and calculate the right amount
        const decimals = SMART_CONTRACT_TOKEN.decimals;
        amount = BigInt(amount * (10**decimals));

        // Stake the token
        const tx = await contractStaking.stake(amount, {
            gasLimit: 250000, // Set an appropriate gas limit
        });

        const transaction = await tx.wait();
        console.log('TRANSACTION', transaction);
        notification('success', 'Success! You can check the', `${WALLET_CONNECT_NETWORK[NETWORK].explorerUrl}/tx/${tx.hash}`, 'transaction here');

        return true;
    } catch (e) {
        notification('error', 'An unexpected error occured, please try again later', '', '');
        console.log(e);
    }

    return false;
}

/**
 * Function to unstake token
 */
export async function unstake(walletProvider: any, isConnected: boolean, period: number) : Promise<boolean> {
    if (isConnected === false) return false;

    let smartContractAddress: string = "";
    let smartContractAbi: Array<any> = [];
    switch (period) {
        case 0:
            smartContractAddress = SMART_CONTRACT_STAKING_0_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_0_MONTH.abi;
            break;
        case 1:
            smartContractAddress = SMART_CONTRACT_STAKING_1_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_1_MONTH.abi;
            break;
        case 3:
            smartContractAddress = SMART_CONTRACT_STAKING_3_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_3_MONTH.abi;
            break;
        case 6:
            smartContractAddress = SMART_CONTRACT_STAKING_6_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_6_MONTH.abi;
            break;
    }

    try {
        // Init smart contract
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contractStaking = new ethers.Contract(smartContractAddress, smartContractAbi, signer);

        // Stake the token
        const tx = await contractStaking.unstake({
            gasLimit: 250000, // Set an appropriate gas limit
        });

        const transaction = await tx.wait();
        console.log('TRANSACTION', transaction);
        notification('success', 'Success! You can check the', `${WALLET_CONNECT_NETWORK[NETWORK].explorerUrl}/tx/${tx.hash}`, 'transaction here');

        return true;
    } catch (e) {
        notification('error', 'An unexpected error occured, please try again later', '', '');
        console.log(e);
    }

    return false;
}

/**
 * Function to claim token
 */
export async function claim(walletProvider: any, isConnected: boolean, period: number) : Promise<boolean> {
    if (isConnected === false) return false;

    let smartContractAddress: string = "";
    let smartContractAbi: Array<any> = [];
    switch (period) {
        case 0:
            smartContractAddress = SMART_CONTRACT_STAKING_0_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_0_MONTH.abi;
            break;
        case 1:
            smartContractAddress = SMART_CONTRACT_STAKING_1_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_1_MONTH.abi;
            break;
        case 3:
            smartContractAddress = SMART_CONTRACT_STAKING_3_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_3_MONTH.abi;
            break;
        case 6:
            smartContractAddress = SMART_CONTRACT_STAKING_6_MONTH.address;
            smartContractAbi = SMART_CONTRACT_STAKING_6_MONTH.abi;
            break;
    }

    try {
        // Init smart contract
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(smartContractAddress, smartContractAbi, signer);

        // Stake the token
        const tx = await contract.claimRewards({
            gasLimit: 250000, // Set an appropriate gas limit
        });

        const transaction = await tx.wait();
        console.log('TRANSACTION', transaction);
        notification('success', 'Success! You can check the', `${WALLET_CONNECT_NETWORK[NETWORK].explorerUrl}/tx/${tx.hash}`, 'transaction here');

        return true;
    } catch (e) {
        notification('error', 'An unexpected error occured, please try again later', '', '');
        console.log(e);
    }

    return false;
}

