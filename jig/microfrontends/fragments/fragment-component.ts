import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";
import {constructor, Inject, Injectable} from "../../core/di";
import {Component, RenderResult, State} from "../../components/component";
import {Platform} from "../../core/platform";

interface FragmentStateComponent {
    response?: FragmentResponse;
    error?: Error;
    latestOptions?: FragmentOptions;
    contentFetched?: boolean;
}

@Injectable()
export abstract class FragmentComponent {
    @State()
    state: FragmentStateComponent = {}
    abstract readonly options: FragmentOptions;
    private contentRendered = false;

    constructor(
        @Inject(FragmentResolver.InjectionToken) protected readonly fragmentResolver: FragmentResolver,
        @Inject(FragmentContentRender.InjectionToken) protected readonly fragmentContentRender: FragmentContentRender,
        @Inject(Platform) protected readonly platform: Platform
        ) {
    }

    async mount(): Promise<void> {
        if (this.state.contentFetched) {
            return;
        }
        await this.fetchFragment();
    }

    render(): RenderResult {
        if (this.state.error) {
            return this.onErrorRender(this.state.error);
        }
        if (this.state.response) {
            return this.fragmentContentRender.render(this.state.response.html);
        }
        return this.placeholder();
    }

    protected placeholder(): RenderResult {
        return document.createElement('div');
    }

    shouldUpdate(): boolean {
        return !this.contentRendered;
    }

    afterRender(): void {
        if (this.state.response || this.state.error) {
            this.contentRendered = true;
        }
    }

    propsChanged(): void {
        if (JSON.stringify(this.options) === JSON.stringify(this.state.latestOptions)) {
            return null;
        }

        this.contentRendered = false;
        this.state = {};
        this.fetchFragment();
    }

    private async fetchFragment(): Promise<void> {
        this.state.latestOptions = {...this.options};
        if (this.options.async && !this.platform.isBrowser) {
            return;
        }
        try {
            this.state.response = await this.fragmentResolver.resolve(this.options);
        } catch (e) {
            this.state.error = e;
        }

        this.state.contentFetched = true;
    }

    protected onErrorRender(error: Error): RenderResult {
        return document.createElement('div');
    }
}


interface FragmentComponentFactoryProps {
    selector: string;
    options: FragmentOptions;
    onErrorRender?: (error: Error) => RenderResult;
}

@Injectable()
export class FragmentComponentFactory {
    createFragment({selector, options, onErrorRender}: FragmentComponentFactoryProps): constructor<FragmentComponent> {

        @Component(selector)
        class DynamicallyCreatedFragment extends FragmentComponent {
            readonly selector: string = selector;
            readonly options: FragmentOptions = options;

            protected onErrorRender(error: Error): RenderResult {
                if (!onErrorRender) {
                    return super.onErrorRender(error);
                }
                return onErrorRender(error);
            }
        }

        return DynamicallyCreatedFragment;
    }
}
