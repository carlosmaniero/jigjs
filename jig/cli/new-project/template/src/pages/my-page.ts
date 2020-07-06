import { component, html } from "jigjs/components";
import {observing} from "jigjs/reactive";

@component()
export class MyPage {
    render() {
        return html`
            <style>
                main {
                    font-family: 'Mandali', sans-serif;
                    text-align: center;
                }
            </style>
            <main>
                <img src="/logo.png" alt="Jig.js Logo" width="300px">
                <h1>Just another example!</h1>
                
                <p>This page takes a while to render on purpose</p>
                <p>You can see into the <strong>app.ts</strong> How to handle async operations in router</p>
            </main>
        `;
    }
}
