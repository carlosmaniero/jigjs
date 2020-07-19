import { lazyEvaluation } from "jigjs/template/render";

export type ElementStyle = {
  '@media': {
    [query: string]: ElementStyle
  }
} | Record<string, Partial<CSSStyleDeclaration> | Record<string, string>>;

const SEED = 5381;

// When we have separate strings it's useful to run a progressive
// version of djb2 where we pretend that we're still looping over
// the same string
// same of
// https://github.com/styled-components/styled-components/blob/216f03deb084b8c8c8980a35e25924457ff8f6e4/packages/styled-components/src/utils/generateAlphabeticName.js
const phash = (h: number, x: string): number => {
  let i = x.length;

  while (i) {
    h = (h * 33) ^ x.charCodeAt(--i);
  }

  return h;
};

// This is a djb2 hashing function
const hash = (x: string): number => {
  return phash(SEED, x);
};

const JIG_STYLE_ID = 'jig-style-element'

export type JigCssClass = {
  jigLazyRun: (document: Document) => string;
};

export const css = (template: TemplateStringsArray, ...values: unknown[]): JigCssClass =>
 lazyEvaluation((document) => jigcss(document)(template, ...values))

const jigcss = (document: Document) => {
  const getOrCreateStyleElement = () => {
    return document.getElementById(JIG_STYLE_ID) || createStyleElement();
  }

  const createStyleElement = () => {
    const element = document.createElement('style');
    element.id = JIG_STYLE_ID;

    document.head.appendChild(element);

    return element;
  }

  const styleElement = getOrCreateStyleElement();

  const appendToElement = (classes: string) => {
    styleElement.appendChild(document.createTextNode(classes));
  }

  const hasClassHash = (className: string) => {
    return styleElement.innerHTML.includes(className);
  }

  const formatStyle = (style: string, className: string) => {
    const ampPlaceholder = '__jigcss-placeholder_amp_to_be_kept_jigcss-placeholder__';
    return style
      .replace(/\\&/g, ampPlaceholder)
        .replace(/&/g, `.${className}`)
        .replace(new RegExp(ampPlaceholder, 'g'), '&');
  }

  return (template: TemplateStringsArray, ...values: unknown[]): string => {
    const style = String.raw(template, ...values);

    const styleHash = hash(style);
    const className = `jc-${styleHash}`;

    if (hasClassHash(`.${className}`)) {
      return className;
    }

    appendToElement(formatStyle(style, className));

    return className;
  };
}
