import {Component, RenderResult} from "../components/component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";
import {DIContainer, Inject, Injectable} from "../core/di";

export abstract class FragmentComponent extends Component {
    abstract readonly options: FragmentOptions;
    protected response: FragmentResponse;

    protected constructor(private readonly fragmentResolver: FragmentResolver,
                          private readonly fragmentContentRender: FragmentContentRender) {
        super();
    }

    async mount() {
        this.response = await this.fragmentResolver.resolve(this.options);
        this.updateRender();
    }

    render(): RenderResult {
        if (this.response) {
            return this.fragmentContentRender.render(this.response.html);
        }
        return document.createElement('div');
    }
}


interface FragmentComponentFactoryProps {
    selector: string,
    options: FragmentOptions,
}

@Injectable()
export class FragmentComponentFactory {
    constructor(@Inject(FragmentResolver.InjectionToken) private readonly fragmentResolver: FragmentResolver,
                @Inject(FragmentContentRender.InjectionToken) private readonly fragmentContentRender: FragmentContentRender) {
    }

    createFragment({selector, options}: FragmentComponentFactoryProps): FragmentComponent {
        const factory = this;

        return new class extends FragmentComponent {
            readonly selector: string = selector;
            readonly options: FragmentOptions = options;

            constructor() {
                super(factory.fragmentResolver, factory.fragmentContentRender);
            }
        };
    }
}

export const resolverFragmentFactory = () => DIContainer.resolve(FragmentComponentFactory);
