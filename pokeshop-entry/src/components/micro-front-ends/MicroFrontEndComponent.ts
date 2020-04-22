export const registerMicroFrontEndComponent = (window, resolver, isBrowser = false) => {
    class MicroFrontEndComponent extends window.HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            console.log(this);
            console.log(isBrowser);
            console.log(this.getAttribute('async'));
            console.log(this.getAttribute('already-loaded'));

            if (!isBrowser && this.getAttribute('async')) {
                this.finish({});
                return;
            }

            if (!this.getAttribute('already-loaded')) {
                console.log('rendering...');
                this.renderContent();
            }
        }

        async renderContent () {
            const url = this.getAttribute('url');
            const response = await resolver.resolve(url);
            this.innerHTML = response.html;
            this.finish(response);
            this.setAttribute("already-loaded", true);
        }

        private finish(response) {
            const onFinish = this.onFinish;

            onFinish && onFinish(this, response);
        }
    }

    window.customElements.define('front-end-fragment', MicroFrontEndComponent);
}
