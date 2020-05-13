import {Injectable} from "../../core/di";
import {FragmentOptions, FragmentResolver, FragmentResponse} from "../fragments";
import {FragmentFetch} from "../fragment-fetch";

@Injectable([FragmentResolver])
export class BrowserFragmentResolver implements FragmentResolver {
    constructor(private readonly fragmentFetch: FragmentFetch) {
    }

    resolve(options: FragmentOptions): Promise<FragmentResponse> {
        return this.fragmentFetch.fetch(options);
    }
}
