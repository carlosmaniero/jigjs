import {html as lighterHtml, Renderable} from 'lighterhtml';

export type RenderResult = Renderable;

export const html = lighterHtml;

export type JigJoyWindow = Window & {
    HTMLElement: typeof HTMLElement
}

export interface RehydrateService {
    createContext(): string;
    updateContext<T>(contextName: string, object: T): void;
    getContext<T>(contextName: string): T;
}

export const RehydrateService = {
    InjectionToken: 'RehydrateService'
}
