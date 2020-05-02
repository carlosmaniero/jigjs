import {Injectable} from "../core/di";
import {FragmentFetch} from "./fragment-fetch";
import {FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";

export type ServerFragmentResolverResponse = {
    error: Error
} | {
    response: FragmentResponse
}

@Injectable()
export class ServerFragmentResolver implements FragmentResolver {
    private readonly promises: Promise<FragmentResponse>[] = [];

    constructor(private readonly fragmentFetch: FragmentFetch) {
    }

    resolve(options: FragmentOptions): Promise<FragmentResponse> {
        const fragmentResponsePromise = this.fragmentFetch.fetch(options);

        this.promises.push(fragmentResponsePromise);

        return fragmentResponsePromise;
    }

    async waitForAllBeResolved(): Promise<ServerFragmentResolverResponse[]> {
        return await Promise.all(
            this.promises.map((promise) => {
                return promise
                    .then((response) => ({response: response}))
                    .catch((error) => ({error}))
            })
        );
    }
}
