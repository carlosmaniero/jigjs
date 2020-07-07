import {renderComponent} from "jigjs/components";
import {Platform} from "jigjs/framework/patform/platform";
import {appFactory} from "./app";

renderComponent(document.querySelector('#root'), appFactory(window, Platform.browser()));
