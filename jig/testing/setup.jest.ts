import '@abraham/reflection';
import {globalContainer} from "../core/di";
import {register} from "../core/register";

declare let global: any

global.beforeEach(() => {
    jest.restoreAllMocks();
    globalContainer.reset();

    register();
});

global.fixedAssertions = 0;
