import 'isomorphic-fetch';

export interface FragmentResult {
    html: string,
    eventDependencies: string[]
}

type ErrorHookCallback = (url: string, error: Error) => void;

interface FragmentResolverHooks {
    onFatal: ErrorHookCallback,
    onError: ErrorHookCallback
}

const defaultHooks: FragmentResolverHooks = {
    onFatal: () => {},
    onError: () => {}
}

interface FragmentOptions {
    url: string;
    headers?: Record<string, string>,
    required?: boolean
}

export interface FragmentResolver {
    resolve: (options: FragmentOptions) => Promise<FragmentResult>,
}

export class FragmentResolverImpl implements FragmentResolver {
    private hooks: FragmentResolverHooks;

    constructor(hooks: Partial<FragmentResolverHooks> = {}) {
        this.hooks = {...defaultHooks, ...hooks};
    }

    async resolve(options: FragmentOptions): Promise<FragmentResult> {
        const url = options.url;
        const headers = options.headers || {};

        try {
            const res = await fetch(new Request(url, {
                method: 'GET',
                headers: new Headers(headers),
                mode: 'cors',
                cache: 'default'
            }));

            const html = await res.text();
            const eventDependencies = res.headers.get('X-Event-Dependency') || '';

            return {
                html,
                eventDependencies: FragmentResolverImpl.parseDependencies(eventDependencies)
            };
        } catch (e) {
            if (options.required) {
                this.hooks.onFatal(url, e);
                return;
            }
            this.hooks.onError(url, e);
        }
    }

    private static parseDependencies(eventDependencies: string) {
        return eventDependencies.split(',').map((dep) => dep.trim());
    }
}
