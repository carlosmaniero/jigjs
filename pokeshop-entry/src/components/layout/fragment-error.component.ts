export const registerFragmentError = (window) => {
    class FragmentErrorComponent extends window.HTMLElement {
        constructor() {
            super();
            console.log('constructor');
        }

        connectedCallback() {
            console.log('connected');

            this.innerHTML = `
                <style>
                    .fragment-error-component {
                        color: #9d646d;
                        font-family: sans-serif;
                        border: 1px solid #66212c;
                        box-shadow: 5px 5px #66212c;
                        border-radius: 20px;
                        padding: 20px;
                    }
                </style>
                
                <div class="fragment-error-component">
                    🛑️ An error has occurred!
                </div>
            `;
        }
    }

    window.customElements.define('fragment-error-component', FragmentErrorComponent);
}
