import {globalContainer} from "../core/di";

export const createContainer = () => globalContainer.createChildContainer();
