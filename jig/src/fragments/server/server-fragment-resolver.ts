import {FragmentOptions, FragmentResolver, FragmentResponse} from "../fragments";
import {FragmentFetch} from "../fragment-fetch";
import {RequestWaitMiddleware} from "../../server/middlewares";
import {Injectable, Singleton} from "../../core/di";

@Singleton([RequestWaitMiddleware.InjectionToken])
export class ServerFragmentResolverWaitMiddleware implements RequestWaitMiddleware {
    public readonly promises: Promise<FragmentResponse>[] = [];

    async wait(): Promise<void> {
        await Promise.all(
            this.promises.map((promise) => {
                return promise
                    .catch(() => ({}))
            })
        );
    }
}

@Injectable([FragmentResolver.InjectionToken])
export class ServerFragmentResolver implements FragmentResolver {
    constructor(private readonly fragmentFetch: FragmentFetch,
                private readonly serverFragmentResolverWaitMiddleware: ServerFragmentResolverWaitMiddleware) {
    }

    resolve(options: FragmentOptions): Promise<FragmentResponse> {
        const fragmentResponsePromise = this.fragmentFetch.fetch(options);

        fragmentResponsePromise.catch((err) => console.log(err))

        this.serverFragmentResolverWaitMiddleware.promises.push(fragmentResponsePromise);

        return fragmentResponsePromise;
    }
}
