import {Injectable} from "../core/di";
import {FragmentContentRender} from "./fragments";

@Injectable()
export class ServerContentRender implements FragmentContentRender {
    render(html: string): HTMLElement {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div;
    }


}
