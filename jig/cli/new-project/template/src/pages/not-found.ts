import {component, html} from "jigjs/components";
import {Route, RouteLinkElement, RouterLink, RouterLinkFactory} from "jigjs/framework/router/router-link";

@component()
export class NotFound {
    private readonly homeLink: RouterLink;

    constructor(
        linkFactory: RouterLinkFactory,
        private readonly route: string
    ) {
        this.homeLink = linkFactory.createLink(
            new Route('home'),
            new RouteLinkElement('Go back to Home', {class: 'link'})
        );
    }

    render() {
        return html`
            <style>
                main {
                    font-family: 'Mandali', sans-serif;
                    text-align: center;
                }
                
                .link {
                    color: #ff677d;
                }
            </style>
            <main>
                <img src="/logo.png" alt="Jig.js Logo" width="300px">
                <h1>Not Found 😢</h1>
                
                <p>The page <strong>${this.route}</strong> was not found.</p>
                
                <p>
                    ${this.homeLink}
                </p>
            </main>
        `;
    }
}
