 ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

# JigCss - A CSS-in-JS package for Jig.js

This package enables CSS-in-JS.

```typescript
@component()
class MyComponent {
  private readonly css: Css;
  private readonly helloClassName: string;
  private readonly byeClassName: string;

  constructor() {
    this.css = new Css();
    this.helloClassName = this.css.style(`
      background: black;
      color: red;
    `);
    this.byeClassName = this.css.style(`
      background: red;
      color: black;
    `);
  }

  render() {
    return html`
      ${this.css}
      
      <div class="${this.helloClassName}">Hello, World!</div>
      <div class="${this.byeClassName}">Bye!</div>
    `
  }
}
```

Ideally it's better to have just one instance of `Css` in your entire application. 

If you need to have more than one instance of `Css` give the prefix argument to avoid
class name collision `new Css('prefix-')`. 
