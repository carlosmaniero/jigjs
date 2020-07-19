<p align="center" style="color: #343a40">
  <p align="center" >
    <img src="ghassets/logo.svg" alt="jigcss" align="center">
  </p>
  <h1 align="center">css in js for jigjs</h1>
</p>

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Jig](https://github.com/carlosmaniero/jigjs/workflows/JigCss/badge.svg) 
![npm version](https://badge.fury.io/js/jigcss.svg)
[![Coverage Status](https://codecov.io/gh/carlosmaniero/jigjs/branch/main/graph/badge.svg?flag=jigcss)](https://codecov.io/gh/carlosmaniero/jigjs)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

This package enables runtime CSS-in-JS. No babel required.

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

## The `&` wildcard

The `&` wildcard will be replaced with the class name.

There is no option yet to have a class without providing the '&' character such as
(styled-components)[https://github.com/styled-components/styled-components] or (emotion)[https://github.com/emotion-js/emotion]

## TODO:

- Keyframes 
