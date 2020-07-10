import {component, html} from "jigjs/components";
import {Renderable} from "jigjs/template/render";
import {observing} from "jigjs/reactive";

@component()
export class Css {
  @observing()
  private classes: Record<string, string> = {};

  constructor(private readonly prefix = 'css_') {
  }

  render(): Renderable {
    return html`<style>${this.createStyles()}</style>`;
  }

  style(style: string): string {
    const existentClass = this.getClassFromStyleIfExists(style);

    if (existentClass) {
      return existentClass;
    }

    return this.createClassFor(style);
  }

  private createClassFor(style: string) {
    const className = this.getNextClassName();
    this.classes = {...this.classes, [className]: style};
    return className;
  }

  private getClassFromStyleIfExists(style: string) {
    for (const className in this.classes) {
      if (style === this.classes[className]) {
        return className;
      }
    }
  }

  private getNextClassName() {
    return `${this.prefix}${Object.keys(this.classes).length}`
  }

  private createStyles() {
    return Object.keys(this.classes)
      .reduce((acc, className) => acc + this.createStylesFor(className), '');
  }

  private createStylesFor(className: string) {
    return `.${className}{${this.classes[className]}}`;
  }
}
