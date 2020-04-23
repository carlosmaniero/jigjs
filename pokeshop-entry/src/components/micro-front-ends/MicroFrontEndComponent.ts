export const registerMicroFrontEndComponent = (window, resolver, isBrowser = false) => {
    class MicroFrontEndComponent extends window.HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            if (!isBrowser && this.getAttribute('async')) {
                this.finish({});
                return;
            }

            if (!this.getAttribute('already-loaded')) {
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
