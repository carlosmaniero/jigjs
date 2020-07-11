import {component, html} from 'jigjs/components';
import {Route, RouteLinkElement, RouterLink, RouterLinkFactory} from 'jigjs/framework/router/router-link';
import {Counter} from '../components/counter';

@component()
export class Home {
    private readonly myPageLink: RouterLink;
    private readonly counter: Counter;

    constructor(linkFactory: RouterLinkFactory) {
      this.myPageLink = linkFactory.createLink(
          new Route('my-page'),
          new RouteLinkElement('Another page Example', {class: 'link'}),
      );

      this.counter = new Counter();
    }

    render() {
      return html`
            <style>
                main {
                    font-family: 'Mandali', sans-serif;
                    text-align: center;
                }
                
                .link {
                    color: #ff677c;
                }
            </style>
            <main>
                <img src="/logo.png" alt="Jig.js Logo" width="300px">
                <h1>Welcome to your Jig.js application</h1>

                <div>
                    ${this.counter}
                </div>
                
                <p>
                    ${this.myPageLink}
                </p>                
            </main>
        `;
    }
}
