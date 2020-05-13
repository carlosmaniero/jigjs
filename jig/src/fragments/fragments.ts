export interface FragmentOptions {
    url: string;
    async?: boolean;
    headers?: Record<string, string>;
}

export interface FragmentResponse {
    html: string;
    dependencies: string[];
}

export interface FragmentResolver {
    resolve(options: FragmentOptions): Promise<FragmentResponse>;
}

export const FragmentResolver = {
    InjectionToken: 'FragmentResolver'
}

export interface FragmentContentRender {
    render: (html: string) => HTMLElement;
}

export const FragmentContentRender = {
    InjectionToken: 'FragmentContentRender'
}

export class FragmentResolverError extends Error {
    constructor(
        public readonly fragmentOptions: FragmentOptions,
        public readonly error: Response | Error) {
        super(`FragmentResolverError: ${fragmentOptions.url}`);
    }
}
