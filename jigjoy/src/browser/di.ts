import {DIContainer, registerContextualDependencies} from "../core/di";

export const createContainer = () => {
    const requestContainer = DIContainer.createChildContainer();
    registerContextualDependencies(requestContainer);
    return requestContainer;
}
