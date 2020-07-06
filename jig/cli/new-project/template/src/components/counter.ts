import {component, html} from "jigjs/components";
import {observing} from "jigjs/reactive/index";

@component()
export class Counter {
    @observing()
    private number: number;

    constructor() {
        this.number = 0;
    }

    render() {
        return html`

        <style>
            .counter {
                background: #fafafa;
                border-radius: 20px;
                padding: 20px;
            }
            .counter h2 {
                margin-top: 0;
            }
            .counter__action-button {
                background: #1E3040;
                border: 0;
                border-radius: 10px;
                padding: 10px 40px;
                color: #ffffff;
            }              
        </style>

        <section class="counter">
            <h2>Simple Counter Component</h2>
            <button class="counter__action-button" onclick="${() => this.number--}">-</button>
            <span>${this.number}</span>
            <button class="counter__action-button" onclick="${() => this.number++}">+</button>
        </section>
        `
    }
}
