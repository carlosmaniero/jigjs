import * as di from './core/di'

export const core = {
    di,
    entrypoint: require('./core/entrypoint'),
    register: require('./core/register'),
};

export const components = require('./components/component')
