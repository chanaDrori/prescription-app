import axios from "axios";
import { DrugDetail } from "../Interfaces";

const backendUrl = "http://localhost:5000/api/"  //"Config.backend"
const httpClient = axios.create({
    baseURL: `${backendUrl}`
});

export default class RequestService {

    public async backendGet(url: string): Promise<any> {
        const response = await httpClient.get(url)
            .then((response) => {
                return response
            })
            .catch((error) => {
                return error.response;
            });
        return response;
    }

    private timeoutId?: number = undefined;

    public async getData(searchTerm: string,
        setOption: (options: DrugDetail[]) => void,
        setErrorMessageSearch: (message: string) => void) {

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(async () => {
            const response = await this.backendGet(`search?txt=${searchTerm}`);
            if (response.status != 200) {
                setErrorMessageSearch(response.data);
            } else {
                setOption((response as any).data.data);
            }
        }, 100);
    };

    public async getWarnings(listId: string[]){
        const response = await this.backendGet(`add?ids=${listId}`);
        return response
    }
}
