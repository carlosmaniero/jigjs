import '@abraham/reflection';
import {globalContainer} from "../core/di";
import {register} from "../core/register";

declare let global: any

global.beforeEach(() => {
    jest.spyOn(console, 'error');
    globalContainer.reset();

    register();
});

global.afterEach(() => {
    expect(console.error).not.toBeCalled();
});

global.fixedAssertions = 1;
