 ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

# Jig.css - A CSS-in-JS package for Jig.js. No babel required.

This package enables runtime CSS-in-JS

## Installation

```shell script
npm install jigcss
```

# Usage

```typescript
import {css} from 'jigcss';


@component()
class MyComponent {
  // Simple class
  private static readonly helloClassName = css`
    & {
      background-color: black;
      color: red;
    }
  `;

  // class with extra selectors
  private static readonly byeClassName = css`
      & {
        backgroundColor: black;
        color: red;
      }

      &:hover {
        color: blue;
      }

      & a {
        color: green;
      }

      @media: {
        screen and (min-width: 700px): {
          &: {
            color: 'blue',
          }
        }
      }
    `;

  constructor(window) {

    
  }

  render() {
    return html`      
      <div class="${this.helloClassName}">Hello, World!</div>
      <div class="${this.byeClassName}">Bye! <a href="#">Go Home</a></div>
      <div class="${css`
        & { 
          background: red;
        }`}"></div>
    `
  }
}
```

## The & wildcard

The `&` wildcard will be replaced with the class name.

There is no option yet to have a class without providing the '&' character such as
(styled-components)[https://github.com/styled-components/styled-components] or (emotion)[https://github.com/emotion-js/emotion]

## TODO:

- Keyframes 
