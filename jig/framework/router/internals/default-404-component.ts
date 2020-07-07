import {component, html} from "../../../components";
import {Renderable} from "../../../template/render";

@component()
export class Default404Component {
    render(): Renderable {
        return html`404 - Not Found`;
    }
}
