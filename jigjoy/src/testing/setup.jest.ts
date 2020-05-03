import "reflect-metadata";
import {DIContainer} from "../core/di";
import {register} from "../core/register";

declare var global: any

global.beforeEach(() => {
    DIContainer.reset();

    register();
})
