export interface RequestWaitMiddleware {
    wait: () => Promise<void>
}

export const RequestWaitMiddleware = {
    InjectionToken: 'RequestWaitMiddleware'
}
