import {registerMicroFrontEndComponent} from "./micro-front-ends/micro-front-end.component";
import {FragmentResolver} from "../services/fragment-resolver";
import {registerHeaderComponent} from "./layout/header.component";

registerMicroFrontEndComponent(window, new FragmentResolver(), true);
registerHeaderComponent(window);
