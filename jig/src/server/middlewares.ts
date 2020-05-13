export interface RequestWaitMiddleware {
    wait: () => Promise<void>;
}

export const RequestWaitMiddleware = {
    InjectionToken: 'RequestWaitMiddleware'
}

export interface BeforeFlushRequest {
    beforeFlushRequest: () => void;
}

export const BeforeFlushRequest = {
    InjectionToken: 'BeforeFlushRequest'
}
