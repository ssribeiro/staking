/**
 * Function to Shorten address
 * @param address
 */
export function addressShortener(address: any) {
    return `${address.substring(0, 7)}...${address.substring(address.length - 5, address.length)}`;
}

/**
 * Function to delay
 * @param ms
 */
export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
