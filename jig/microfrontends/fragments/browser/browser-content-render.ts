import {Injectable} from "../../../core/di";
import {FragmentContentRender} from "../fragments";
import {Renderable} from "../../../template/render";

@Injectable([FragmentContentRender])
export class BrowserContentRender implements FragmentContentRender {
    render(html: string): Renderable {
        const htmlDivElement = this.appendElementsToDiv(html);
        const fragment = document.createDocumentFragment();

        while (htmlDivElement.childNodes.length !== 0) {
            fragment.appendChild(htmlDivElement.childNodes[0]);
        }

        return fragment;
    }


    private appendElementsToDiv(html: string) {
        const div = document.createElement('div');
        div.innerHTML = html;

        div.querySelectorAll('script')
            .forEach((script: HTMLScriptElement) => {
                const recreatedScript = window.document.createElement('script');

                recreatedScript.setAttribute('jig-joy-checked', "true");

                for (const attribute of script.getAttributeNames()) {
                    recreatedScript.setAttribute(attribute, script.getAttribute(attribute));
                }

                recreatedScript.innerHTML = script.innerHTML;

                script.remove();
                div.appendChild(recreatedScript);
            });

        return div;
    }
}
