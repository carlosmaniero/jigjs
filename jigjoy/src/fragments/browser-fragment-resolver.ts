import {Injectable} from "../core/di";
import {FragmentFetch} from "./fragment-fetch";
import {FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";

@Injectable()
export class BrowserFragmentResolver implements FragmentResolver {
    constructor(private readonly fragmentFetch: FragmentFetch) {
    }

    resolve(options: FragmentOptions): Promise<FragmentResponse> {
        return this.fragmentFetch.fetch(options);
    }
}
