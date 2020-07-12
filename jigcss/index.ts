import {JigWindow} from "jigjs/types";

export type MediaQueryStyle = Record<string, string> & {
  query: string;
}

export type ElementStyle = {
  '@media': {
    [query: string]: ElementStyle
  }
} | Record<string, Record<string, string>>;

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

export class Css {
  private static JIG_STYLE_ID = 'jig-style-element';
  private styleElement: HTMLElement;

  constructor(private readonly window: JigWindow) {
    this.styleElement = this.getOrCreateStyleElement();
  }

  style(elementStyle: ElementStyle): string {

    this.validateElementStyle(elementStyle);

    const className = this.createClassHash(elementStyle);

    if (!this.hasClassHash(className)) {
      this.appendToElement(this.createStylesFor(elementStyle, className));
    }
    return className;
  }

  private createClassHash(style: ElementStyle) {
    return "jig-" + hash(JSON.stringify(style));
  }

  private hasClassHash(className: string) {
    return this.styleElement.innerHTML.includes('.' + className + '{');
  }

  private createStylesFor(elementStyle: ElementStyle | Record<string, string>, className: string) {
    return Object.keys(elementStyle).map((elementStyleKey) => {
      if (elementStyleKey === '@media') {
        const media = elementStyle['@media'] as Record<string, Record<string, Record<string, string>>>;

        return Object.keys(media).map((query) => {
          const classes = media[query];

          return `@media ${query} {${this.createStylesFor(classes, className)}}`;
        }).join('');
      }

      const selector = this.createSelector(className, elementStyleKey);
      return `${selector}{${this.toClassBody(elementStyle[elementStyleKey])}}`
    }).join('');
  }

  private createSelector(className: string, elementStyleKey: string) {
    if (!elementStyleKey.startsWith('&')) {
      throw new Error(`The selector must starts with "&". Found: "${elementStyleKey}".`);
    }
    return elementStyleKey.replace(/&/g, '.' + className);
  }

  private validateElementStyle(elementStyle: ElementStyle) {
    if (elementStyle['@media'] && !(typeof elementStyle['@media'] === 'object')) {
      throw new Error(`The @media selector must be an object. Found: "${typeof elementStyle['@media']}".`);
    }
  }

  private getOrCreateStyleElement() {
    return this.window.document.getElementById(Css.JIG_STYLE_ID) || this.createStyleElement();
  }

  private createStyleElement() {
    const element = this.window.document.createElement('style');
    element.id = Css.JIG_STYLE_ID;

    this.window.document.head.appendChild(element);

    return element;
  }

  private appendToElement(classes: string) {
    this.styleElement.appendChild(this.window.document.createTextNode(classes));
  }

  private toClassBody(elementStyleElement: Record<string, string>) {
    return Object.keys(elementStyleElement)
      .map((property) => `${this.toKebabCase(property)}: ${elementStyleElement[property]}`)
      .join(';');
  }

  private toKebabCase(property: string) {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
  }
}
