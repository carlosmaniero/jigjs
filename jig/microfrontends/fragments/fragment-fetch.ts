import 'isomorphic-fetch'
import {FragmentOptions, FragmentResolverError, FragmentResponse} from "./fragments";
import {Injectable} from "../../core/di";
import {ErrorHandler} from "../../error/error-handler";

@Injectable()
export class FragmentFetch {
    constructor(private readonly errorHandler: ErrorHandler) {
    }

    async fetch(options: FragmentOptions): Promise<FragmentResponse> {
        const url = options.url;
        const headers = options.headers || {};

        let res;
        try {
            res = await fetch(new Request(url, {
                method: 'GET',
                headers: new Headers(headers),
                mode: 'cors',
                cache: 'default'
            }));
        } catch (e) {
            const fragmentResolverError = new FragmentResolverError(options, e);
            this.handleError(options, fragmentResolverError);
            throw fragmentResolverError;
        }

        return await this.handleResponse(res, options);
    }

    private async handleResponse(res: Response, options: FragmentOptions): Promise<FragmentResponse> {
        if (res.status > 299) {
            const fragmentResolverError = new FragmentResolverError(options, res);
            this.handleError(options, fragmentResolverError);
            return Promise.reject(
                fragmentResolverError
            )
        }

        const html = await res.text();

        return {
            html
        };
    }

    private handleError(options: FragmentOptions, fragmentResolverError: FragmentResolverError): void {
        options.required && this.errorHandler.fatal(fragmentResolverError);
    }
}
