import { StorageService, STORAGE_KEYS } from "./storage.service";
import { notification } from "./notification.service";

export class ApiService {

    /** STORAGE */
    public storage: StorageService;


    constructor() {
        this.storage = new StorageService();
    }

    /**
     * REQUEST GET
     * @param path of API
     * @param params
     * @param useToken
     */
    async get(path: string, useToken: boolean = false, params?: URLSearchParams): Promise<any> {
        let parameters = params === undefined ? new URLSearchParams : params

        if(useToken) {
            parameters.append('token', String(this.storage.getItem(STORAGE_KEYS.TOKEN)))
        }

        const header = {
            headers: { 'Content-Type': 'application/json' },
            method: 'GET',
        }

        return fetch(`${import.meta.env.VITE_API_URL}/${path}?${parameters.toString()}`, header)
            .then(async response => {
                const result = await response.json()
                if(response.status !== 200) throw result;

                return result
            }).catch( async (error) => {
                if (error.error === "ERR_00007") {
                    this.storage.deleteLocalStorage();
                    await notification('error', 'Error token');
                }
                throw error
            })
    }


    /**
     * REQUEST POST
     * @param path of API
     * @param body value to send
     * @param useToken value to send
     * @param params
     */
    async post(path: string, body: string | FormData, useToken: boolean = false ,params?: URLSearchParams): Promise<any> {

        let parameters = params === undefined ? new URLSearchParams : params

        if(useToken) {
            parameters.append('token', String(this.storage.getItem(STORAGE_KEYS.TOKEN)))
        }

        const header = {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: body
        }

        if(body instanceof FormData) { // @ts-ignore
            delete header.headers;
        }


        return fetch(`${import.meta.env.VITE_API_URL}/${path}?${parameters.toString()}`, header)
            .then(async response => {
                const result = await response.json()

                if (response.status !== 200) {
                    throw result
                }
                return result
            })
            .catch((error) => {
                throw error
            })
    }



    /**
     * REQUEST PUT
     * @param path of API
     * @param body value to send
     * @param useToken
     * @param params
     */
    async put(path: string, body: string | FormData, useToken: boolean, params?: URLSearchParams): Promise<any> {

        let parameters = params === undefined ? new URLSearchParams : params

        if(useToken) {
            parameters.append('token', String(this.storage.getItem(STORAGE_KEYS.TOKEN)))
        }

        let header = {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: body
        }

        if(typeof body !== "string") { // @ts-ignore
            delete header.headers;
        }

        return fetch(`${import.meta.env.VITE_API_URL}/${path}?${parameters.toString()}`, header)
            .then(async response => {
                const result = await response.json()

                if (response.status !== 200) {
                    throw result
                }
                return result
            })
            .catch((error) => {
                throw error
            })
    }

    /**
     * REQUEST PATCH
     * @param path of API
     * @param body value to send
     * @param useToken
     * @param params
     */
    async patch(path: string, body: any | FormData, useToken: boolean, params?: URLSearchParams): Promise<any> {

        let parameters = params === undefined ? new URLSearchParams : params

        if(useToken) {
            parameters.append('token', String(this.storage.getItem(STORAGE_KEYS.TOKEN)))
        }

        let header = {
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            body: JSON.stringify(body)
        }

        return fetch(`${import.meta.env.VITE_API_URL}/${path}?${parameters.toString()}`, header)
            .then(async response => {
                const result = await response.json()

                if (response.status !== 200) {
                    throw result
                }
                return result
            })
            .catch((error) => {
                throw error
            })
    }


}

