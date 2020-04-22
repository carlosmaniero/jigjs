import 'isomorphic-fetch';


export class FragmentResolver {
    async resolve(url: string) {
        const res = await fetch(url);
        const html = await res.text();
        return {
            html,
            eventDependencies: res.headers.get('X-Event-Dependency') || null
        };
    }
}
