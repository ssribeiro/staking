export const STORAGE_KEYS = {
    TOKEN: 'token',
};

export class StorageService {

    /**
     * Function to set a value in local storage
     * @param key
     * @param value
     */
    setItem(key: string, value: string): void {
        window.localStorage.setItem(key, value);
    }

    /**
     * Function to get a value from local storage
     * @param key
     */
    getItem(key: string): string | null {
        return window.localStorage.getItem(key);
    }

    /**
     * Function to clear local storage
     */
    deleteLocalStorage(): void {
        window.localStorage.clear()
    }

}

