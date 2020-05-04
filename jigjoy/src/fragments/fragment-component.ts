import {Component, RenderResult} from "../components/component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";
import {DIContainer, Inject, GlobalInjectable} from "../core/di";

export abstract class FragmentComponent extends Component {
    abstract readonly options: FragmentOptions;
    protected response: FragmentResponse;
    private error: Error;

    protected constructor(private readonly fragmentResolver: FragmentResolver,
                          private readonly fragmentContentRender: FragmentContentRender) {
        super();
    }

    async mount() {
        try {
            this.response = await this.fragmentResolver.resolve(this.options);
        } catch (e) {
            this.error = e;
        }
        this.updateRender();
    }

    render(): RenderResult {
        if (this.error) {
            return this.onErrorRender(this.error);
        }
        if (this.response) {
            return this.fragmentContentRender.render(this.response.html);
        }
        return document.createElement('div');
    }

    protected onErrorRender(error: Error): RenderResult {
        return document.createElement('div');
    }
}


interface FragmentComponentFactoryProps {
    selector: string,
    options: FragmentOptions,
    onErrorRender?: (error: Error) => RenderResult
}

@GlobalInjectable()
export class FragmentComponentFactory {
    constructor(
        @Inject(FragmentResolver.InjectionToken) private readonly fragmentResolver: FragmentResolver,
        @Inject(FragmentContentRender.InjectionToken) private readonly fragmentContentRender: FragmentContentRender) {
    }

    createFragment({selector, options, onErrorRender}: FragmentComponentFactoryProps): FragmentComponent {
        const factory = this;

        return new class extends FragmentComponent {
            readonly selector: string = selector;
            readonly options: FragmentOptions = options;

            constructor() {
                super(factory.fragmentResolver, factory.fragmentContentRender);
            }

            protected onErrorRender(error: Error): RenderResult {
                if (!onErrorRender) {
                    return super.onErrorRender(error);
                }
                return onErrorRender(error);
            }
        };
    }
}
