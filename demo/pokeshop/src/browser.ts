import {renderComponent} from "jigjs/pure-components";
import {appFactory} from "./app";

(window as any).onload = () => {
    renderComponent(document.querySelector('#root'), appFactory(window))
}
