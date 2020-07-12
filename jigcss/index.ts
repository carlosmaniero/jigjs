import {JigWindow} from "jigjs/types";

export type ElementStyle = {
  base: string
} & Record<string, string>;

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

  style(style: string | ElementStyle): string {
    const elementStyle = this.toElementStyle(style);

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

  private createStylesFor(elementStyle: ElementStyle, className: string) {
    return Object.keys(elementStyle).map((elementStyleKey) => {
      if (elementStyleKey === 'base') {
        return `.${className}{${elementStyle.base}}`
      }

      const classNameTransformed = this.classNameWithTransformation(className, elementStyleKey);
      return `.${classNameTransformed}{${elementStyle[elementStyleKey]}}`
    }).join('');
  }

  private toElementStyle(style: string | ElementStyle): ElementStyle {
    if (typeof style === 'string') {
      return {base: style};
    }

    return style;
  }

  private classNameWithTransformation(className: string, elementStyleKey: string) {
    return elementStyleKey.replace(/&/g, className);
  }

  private validateElementStyle(elementStyle: ElementStyle) {
    const nonStandardKey = Object.keys(elementStyle).find((key) => key !== 'base' && !key.startsWith('&'));
    if (nonStandardKey) {
      throw new Error(`The style transformation must starts with "&". Found: "${nonStandardKey}".`);
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
}
