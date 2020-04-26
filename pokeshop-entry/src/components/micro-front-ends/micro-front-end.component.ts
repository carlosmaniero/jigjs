import {frontEndDIServiceFromDocument} from "../../services/front-end-di.service";

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
            const headers = this.getAttribute('headers') || '{}';

            try {
                const response = await resolver.resolve(url, JSON.parse(headers));

                this.innerHTML = response.html;

                this.forceJavascriptToLoad();
                this.injectDependencies(response);

                this.finish(response);
                this.setAttribute("already-loaded", true);
            } catch (e) {
                const shadowDom = this.attachShadow({mode: 'open'});
                shadowDom.innerHTML = `<slot name="fragment-error"></slot>`
                this.finish(undefined);
            }
        }

        private finish(response) {
            const onFinish = this.onFinish;

            onFinish && onFinish(this, response);
        }

        private injectDependencies({eventDependencies}) {
            if (!eventDependencies) {
                return;
            }
            frontEndDIServiceFromDocument(this.ownerDocument)
                .injectDependencyOfEvent(eventDependencies);
        }

        private forceJavascriptToLoad() {
            if (!isBrowser) {
                return;
            }

            this.querySelectorAll('script')
                .forEach((script: HTMLScriptElement) => {
                    const recreatedScript = window.document.createElement('script');

                    recreatedScript.textContent = script.textContent;
                    recreatedScript.setAttribute('data-dynamic-loaded', "true");

                    for (let attribute of script.getAttributeNames()) {
                        recreatedScript.setAttribute(attribute, script.getAttribute(attribute));
                    }

                    this.appendChild(recreatedScript);

                    script.remove();
                })
        }
    }

    window.customElements.define('front-end-fragment', MicroFrontEndComponent);
}
