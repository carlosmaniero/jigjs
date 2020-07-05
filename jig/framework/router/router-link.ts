import {component, html, RenderableComponent} from "../../components";
import {Renderable} from "../../template/render";
import {Navigation} from "./navigation";
import {observing} from "../../reactive";
import {Routes} from "./routes";

export class Route {
    constructor(private readonly name: string,
                private readonly params: Record<string, string> = {}) {
    }

    reverse(routes: Routes): string {
        return routes.reverse(this.name, this.params);
    }

    navigateTo(navigation: Navigation): void {
        navigation.navigateTo(this.name, this.params);
    }
}

export class RouteLinkElement {
    constructor(readonly content: Renderable | string | number | RenderableComponent,
                readonly attributes: Record<string, string> = {}) {
    }

    renderLink(url: string, onClick: (event: MouseEvent) => void): Renderable {
        return html`<a ${this.attributes} onclick="${onClick}" href="${url}">${this.content}</a>`
    }
}

@component()
export class RouterLink {
    @observing()
    private linkElement: RouteLinkElement;
    @observing()
    private route: Route;

    private readonly routes: Routes;
    private readonly navigation: Navigation;

    constructor(routes: Routes, navigation: Navigation, route: Route, routeElement: RouteLinkElement) {
        this.routes = routes;
        this.navigation = navigation;
        this.route = route;
        this.linkElement = routeElement;

    }

    render(): Renderable {
        return this.linkElement.renderLink(this.route.reverse(this.routes), (event: MouseEvent) => this.onLinkClick(event));
    }

    updateElement(linkElement: RouteLinkElement): void {
        this.linkElement = linkElement;
    }

    updateRoute(route: Route): void {
        this.route = route;
    }

    private onLinkClick(event: MouseEvent): void {
        if (event.metaKey || event.shiftKey || event.altKey || event.ctrlKey) {
            return;
        }
        event.preventDefault();
        this.route.navigateTo(this.navigation);
    }
}

export class RouterLinkFactory {
    constructor(private readonly navigation: Navigation, private readonly routes: Routes) {

    }


    createLink(route: Route, routeElement: RouteLinkElement): RouterLink {
        return new RouterLink(this.routes, this.navigation, route, routeElement);
    }
}
