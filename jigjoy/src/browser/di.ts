import {globalContainer, registerContextualDependencies} from "../core/di";

export const createContainer = () => {
    const requestContainer = globalContainer.createChildContainer();
    registerContextualDependencies(requestContainer);
    return requestContainer;
}
