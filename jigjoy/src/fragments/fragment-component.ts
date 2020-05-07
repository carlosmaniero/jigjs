import {Component, RehydrateService, RenderResult} from "../components/component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";
import {DIContainer, Inject, GlobalInjectable} from "../core/di";

interface State {
    response?: FragmentResponse;
    error?: Error;
}

export abstract class FragmentComponent extends Component<State> {
    state: State = {}
    abstract readonly options: FragmentOptions;

    protected constructor(private readonly fragmentResolver: FragmentResolver,
                          private readonly fragmentContentRender: FragmentContentRender,
                          rehydrateService?: RehydrateService) {
        super(rehydrateService);
    }

    async mount() {
        try {
            this.setState({response: await this.fragmentResolver.resolve(this.options)});
        } catch (e) {
            this.setState({error: e});
        }
        this.updateRender();
    }

    render(): RenderResult {
        if (this.state.error) {
            return this.onErrorRender(this.state.error);
        }
        if (this.state.response) {
            return this.fragmentContentRender.render(this.state.response.html);
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
        @Inject(FragmentContentRender.InjectionToken) private readonly fragmentContentRender: FragmentContentRender,
        @Inject(RehydrateService.InjectionToken) private readonly rehydrateService: RehydrateService) {
    }

    createFragment({selector, options, onErrorRender}: FragmentComponentFactoryProps): FragmentComponent {
        const factory = this;

        return new class extends FragmentComponent {
            readonly selector: string = selector;
            readonly options: FragmentOptions = options;

            constructor() {
                super(factory.fragmentResolver, factory.fragmentContentRender, factory.rehydrateService);
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
