export const registerTitle = (window) => {
    class Title extends window.HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = `
                <style>
                    .title-component {
                        font-family: sans-serif;
                        padding: 10px 0;
                        color: #A67B92;
                        display: inline-block;
                    }
                    .title-component h1 {
                        font-size: 1.5em;
                    }
                </style>
                <header class="title-component">
                    <h1>${this.getAttribute('text')}</h1>
                </header>
            `
        }
    }

    window.customElements.define('title-component', Title);
}
