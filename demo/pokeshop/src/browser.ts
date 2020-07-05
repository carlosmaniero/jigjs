import {renderComponent} from "jigjs/pure-components/pure-component";
import {appFactory} from "./app";

(window as any).onload = () => {
    renderComponent(document.querySelector('#root'), appFactory(window))
}
