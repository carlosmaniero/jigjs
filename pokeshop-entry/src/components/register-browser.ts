import {registerMicroFrontEndComponent} from "./micro-front-ends/micro-front-end.component";
import {FragmentResolver} from "../services/fragment-resolver";
import {registerFragmentError} from "./layout/fragment-error.component";

registerMicroFrontEndComponent(window, new FragmentResolver(), true);
registerFragmentError(window);
