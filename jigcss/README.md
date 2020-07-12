 ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

# Jig.css - A CSS-in-JS package for Jig.js

This package enables CSS-in-JS.

## Installation

```shell script
npm install jigcss
```

# Usage

```typescript
import {Css} from 'jigcss';


@component()
class MyComponent {
  private readonly css: Css;
  private readonly helloClassName: string;
  private readonly byeClassName: string;

  constructor(window) {
    this.css = new Css(window);
    this.helloClassName = this.css.style(`
      background: black;
      color: red;
    `);
    this.byeClassName = this.css.style({
      '&': `
        background: black;
        color: red;
      `,
      '&:hover': 'color: blue;',
      '@media': [{
        query: 'screen and (min-width: 700px)',
        '&': 'color: blue;'
      }]
    });
  }

  render() {
    return html`      
      <div class="${this.helloClassName}">Hello, World!</div>
      <div class="${this.byeClassName}">Bye!</div>
    `
  }
}
```

## TODO:

- Keyframes 
