import {Request as ExpressRequest, Response as ExpressResponse} from "express";

export type Request = ExpressRequest;
export type Response = ExpressResponse;
export const Request = {InjectionToken: 'Request'}
export const Response = {InjectionToken: 'Response'}
