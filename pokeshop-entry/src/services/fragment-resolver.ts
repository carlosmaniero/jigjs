import 'isomorphic-fetch';


export class FragmentResolver {
    async resolve(url: string, headers: Record<string, string> = {}) {
        const res = await fetch(new Request(url, {
            method: 'GET',
            headers: new Headers(headers),
            mode: 'cors',
            cache: 'default'
        }));

        const html = await res.text();
        return {
            html,
            eventDependencies: res.headers.get('X-Event-Dependency') || null
        };
    }
}
