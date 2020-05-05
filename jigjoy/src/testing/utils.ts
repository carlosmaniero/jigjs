import * as testingLibrary from '@testing-library/dom'
import {Component} from "../components/component";
import {JSDOM} from "jsdom";
import {Matcher} from "@testing-library/dom/matches";
import {SelectorMatcherOptions} from "@testing-library/dom/query-helpers";
import {WaitForElementOptions} from "@testing-library/dom/wait-for-element";

type QueryAllMatcher = (id: Matcher, options?: SelectorMatcherOptions) => HTMLElement[]
type QueryMatcher = (id: Matcher, options?: SelectorMatcherOptions) => HTMLElement | null
type GetMatcher = (id: Matcher, options?: SelectorMatcherOptions) => HTMLElement
type FindAllMatcher = (id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: WaitForElementOptions) => Promise<HTMLElement[]>
type FindMatcher = (id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: WaitForElementOptions) => Promise<HTMLElement>

interface Matchers {
    findAllByAltText: QueryAllMatcher,
    findAllByDisplayValue: QueryAllMatcher,
    findAllByLabelText: FindAllMatcher,
    findAllByPlaceholderText: FindAllMatcher,
    findAllByRole: QueryAllMatcher,
    findAllByTestId: QueryAllMatcher,
    findAllByText: QueryAllMatcher,
    findAllByTitle: QueryAllMatcher,
    findByAltText: QueryMatcher,
    findByDisplayValue: QueryMatcher,
    findByLabelText: FindMatcher,
    findByPlaceholderText: FindMatcher,
    findByRole: QueryMatcher,
    findByTestId: QueryMatcher,
    findByText: QueryMatcher,
    findByTitle: QueryMatcher,
    getAllByAltText: QueryAllMatcher,
    getAllByDisplayValue: QueryAllMatcher,
    getAllByLabelText: QueryAllMatcher,
    getAllByPlaceholderText: QueryAllMatcher,
    getAllByRole: QueryAllMatcher,
    getAllByTestId: QueryAllMatcher,
    getAllByText: QueryAllMatcher,
    getAllByTitle: QueryAllMatcher,
    getByAltText: GetMatcher,
    getByDisplayValue: GetMatcher,
    getByLabelText: GetMatcher,
    getByPlaceholderText: GetMatcher,
    getByRole: GetMatcher,
    getByTestId: GetMatcher,
    getByText: GetMatcher,
    getByTitle: GetMatcher,
    getNodeText: GetMatcher
    queryAllByAltText: QueryAllMatcher,
    queryAllByAttribute: QueryAllMatcher,
    queryAllByDisplayValue: QueryAllMatcher,
    queryAllByLabelText: QueryAllMatcher,
    queryAllByPlaceholderText: QueryAllMatcher,
    queryAllByRole: QueryAllMatcher,
    queryAllByTestId: QueryAllMatcher,
    queryAllByText: QueryAllMatcher,
    queryAllByTitle: QueryAllMatcher,
    queryByAltText: QueryMatcher,
    queryByAttribute: QueryMatcher,
    queryByDisplayValue: QueryMatcher,
    queryByLabelText: QueryMatcher,
    queryByPlaceholderText: QueryMatcher,
    queryByRole: QueryMatcher,
    queryByTestId: QueryMatcher,
    queryByText: QueryMatcher,
    queryByTitle: QueryMatcher,
}

const isMatcherKey = (key: string) => {
    return key.startsWith('queryBy') || key.startsWith('getBy') || key.startsWith('findBy') ||
        key.startsWith('queryAll') || key.startsWith('getAll') || key.startsWith('findAll');
}

export type RenderResult = Matchers & {
    element: HTMLElement
}

export type RenderOptions = {
    template?: string
}

function getDocumentSnapshot(element) {
    return new JSDOM(element.innerHTML).window.document;
}

const testingLibraryMatchersFor = (element: HTMLElement, dom: JSDOM) => {
    const getMatcher = (key: string) =>
        (matcher: testingLibrary.Matcher,
         options?: testingLibrary.SelectorMatcherOptions,
         waitForElementOptions?: WaitForElementOptions) => {
            testingLibrary[key](getDocumentSnapshot(element), matcher, options, waitForElementOptions);
        }

    return Object.keys(testingLibrary)
        .filter((key) => isMatcherKey(key))
        .map((key) => ({key, fn: getMatcher(key)}))
        .reduce((acc, matcher) => ({...acc, [matcher.key]: matcher.fn}), {}) as Matchers;
}

function renderTemplate(dom, component: Component, options: RenderOptions) {
    if (options && options.template) {
        dom.window.document.body.innerHTML = options.template;
        return dom.window.document.body;
    }

    const element = dom.window.document.createElement(component.selector);
    dom.window.document.body.appendChild(element);
    return element;
}

export const render = (component: Component<any>, options?: RenderOptions): RenderResult => {
    const dom = new JSDOM();
    component.registerCustomElementClass(dom.window as any);
    const element = renderTemplate(dom, component, options);

    const matchers = testingLibraryMatchersFor(element, dom);

    return {
        ...matchers,
        element
    }
}
