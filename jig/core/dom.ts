import {JigWindow} from '../types';

export const DocumentInjectionToken = 'Document';
export const WindowInjectionToken = 'Window';

export interface DOM {
  HTMLElement: { prototype: HTMLElement; new(): HTMLElement };
  document: any;
  window: JigWindow;
  body: HTMLElement;
  head: HTMLHeadElement;
  serialize: () => string;
}

export const configureJSDOM = (data?: string, url?: string): DOM => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jsdom = require('jsdom');
  const dom = new jsdom.JSDOM(data, {url});

  return {
    HTMLElement: dom.window.HTMLElement,
    document: dom.window.document,
    window: dom.window,
    body: dom.window.document.body,
    head: dom.window.document.head,
    serialize: dom.serialize.bind(dom),
  };
};
