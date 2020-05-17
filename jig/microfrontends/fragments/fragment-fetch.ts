import 'isomorphic-fetch'
import {FragmentOptions, FragmentResolverError, FragmentResponse} from "./fragments";
import {GlobalInjectable} from "../../core/di";

@GlobalInjectable()
export class FragmentFetch {
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
            throw new FragmentResolverError(options, e);
        }

        return await FragmentFetch.handleResponse(res, options);
    }

    private static async handleResponse(res: Response, options: FragmentOptions) {
        if (res.status > 299) {
            return Promise.reject(
                new FragmentResolverError(options, res)
            )
        }

        const html = await res.text();

        return {
            html
        };
    }
}
