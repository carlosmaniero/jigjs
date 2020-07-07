import {renderComponent} from "jigjs/components";
import {Platform} from "jigjs/framework/patform/platform";
import {appFactory} from "./app";

(window as any).onload = () => {
    renderComponent(document.querySelector('#root'), appFactory(window, Platform.browser()))
}
