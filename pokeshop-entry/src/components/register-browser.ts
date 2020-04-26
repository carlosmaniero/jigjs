import {registerMicroFrontEndComponent} from "./micro-front-ends/micro-front-end.component";
import {FragmentResolver, FragmentResolverImpl} from "../services/fragment-resolver";
import {registerFragmentError} from "./layout/fragment-error.component";

registerMicroFrontEndComponent(window, new FragmentResolverImpl(), true);
registerFragmentError(window);
