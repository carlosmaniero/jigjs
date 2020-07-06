import {renderComponent} from "jigjs/components";
import {appFactory} from "./app";

renderComponent(document.querySelector('#root'), appFactory(window))
