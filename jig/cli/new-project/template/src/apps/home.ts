import 'jigjs/core/register';
import {JigApp} from "jigjs/core/app";
import {Component, html, OnRehydrate, RenderResult, State} from "jigjs/components/component";
import {Inject, Optional} from 'jigjs/core/di';
import {Request} from "jigjs/router/router";

@Component('home-component')
class Home implements OnRehydrate {
    @State()
    private state = {
        number: 0,
    };

    constructor(@Inject(Request.InjectionToken) @Optional() private readonly request: Request) {
    }

    render(): RenderResult {
        return html`
            <style>
                main {
                    font-family: 'Mandali', sans-serif;
                    text-align: center;
                }
                .action-button {
                    background: #1E3040;
                    border: 0;
                    border-radius: 10px;
                    padding: 10px 40px;
                    color: #ffffff;
                }
            </style>
            <main>
                <img src="logo.png" alt="Jig.js Logo" width="300px">
                <h1>Welcome to your Jig.js application</h1>
                
                <button class="action-button" onclick="${() => {
                    this.state.number++
                }}">+</button>
                    ${this.state.number}
                <button class="action-button" onclick="${() => {
                    this.state.number--
                }}">-</button>
            </main>
        `;
    }

    rehydrate(): void {
        this.state = {
            number: 0,
        }
    }
}

export default new JigApp({
    bundleName: 'home',
    bootstrap: Home,
    components: [],
});
