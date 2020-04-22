import {registerMicroFrontEndComponent} from "./micro-front-ends/MicroFrontEndComponent";
import {FragmentResolver} from "../services/fragment-resolver";

registerMicroFrontEndComponent(window, new FragmentResolver(), true);
