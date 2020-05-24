import {Component, Prop} from "../components/component";
import {html, Renderable} from "../template/render";
import {Router} from "./router";

@Component('router-link')
export class RouterLink {
    @Prop()
    private readonly name: string;

    @Prop()
    private readonly params: Record<string, string>;

    @Prop()
    private readonly children: Renderable;

    constructor(private readonly router: Router) {
    }

    render(): Renderable {
        return html`<a href="${(this.getUrl())}" onclick="${(e) => this.goTo(e)}">
            ${this.children}
        </a>`
    }

    private getUrl() {
        return this.router.reverse(this.name, this.params);
    }

    private goTo(e: Event) {
        e.preventDefault();
        this.router.goTo(this.name, this.params);
    }
}
