import { screen } from "@testing-library/dom";
import { component, html, renderComponent } from "jigjs/components";
import { observing } from "jigjs/reactive";
import * as jigcss from "../";
import { Css, css } from "../";

describe('jigcss', () => {
  const waitForPromises = () => new Promise((resolve) => setImmediate(resolve));

  describe('attribute based', () => {
    it('renders the css property - attribute', async () => {
      @component()
      class MyComponent {
        private readonly css: Css;
        private readonly helloClassName: string;
        private readonly byeClassName: string;

        constructor() {
          this.css = new Css(window);

          this.helloClassName = this.css.style({
            '&': {
              background: 'black',
              color: 'red',
            }
          });
          this.byeClassName = this.css.style({
            '&': {
              background: 'red',
              color: 'black',
            }
          });
        }

        render() {
          return html`
            <div class="${this.helloClassName}">Hello, World!</div>
            <div class="${this.byeClassName}">Bye!</div>
          `
        }
      }

      renderComponent(document.body, new MyComponent());

      expect(screen.getByText('Hello, World!')).toHaveStyle('background: black');
      expect(screen.getByText('Hello, World!')).toHaveStyle('color: red');
      expect(screen.getByText('Bye!')).toHaveStyle('background: red');
      expect(screen.getByText('Bye!')).toHaveStyle('color: black');
    });

    it('updates styles when a class is created - attribute', async () => {
      @component()
      class MyComponent {
        readonly css: Css;
        @observing()
        helloClassName = '';

        constructor() {
          this.css = new Css(window);
        }

        render() {
          return html`
            <div class="${this.helloClassName}">Hello, World!</div>
          `
        }
      }

      const myComponent = new MyComponent();

      renderComponent(document.body, myComponent);

      myComponent.helloClassName = myComponent.css.style({
        '&': {
          background: 'black'
        }
      });

      await waitForPromises();

      expect(screen.getByText('Hello, World!')).toHaveStyle('background: black');
    });

    describe('removing duplicated classes', () => {
      it('prevent equal classes to be created - attribute', async () => {
        @component()
        class MyComponent {
          private readonly css: Css;
          private readonly helloClassName: string;
          private readonly byeClassName: string;

          constructor() {
            this.css = new Css(window);
            this.helloClassName = this.css.style({
              '&': {
                background: 'black',
                color: 'red',
              }
            });
            this.byeClassName = this.css.style({
              '&': {
                background: 'black',
                color: 'red',
              }
            });
          }

          render() {
            return html`
            <div class="${this.helloClassName}">Hello, World!</div>
            <div class="${this.byeClassName}">Bye!</div>
          `
          }
        }

        renderComponent(document.body, new MyComponent());

        expect(screen.getByText('Hello, World!'))
          .toHaveClass(screen.getByText('Bye!').className);
      });
    });

    describe('element style', () => {
      it('renders the base style - attribute', () => {
        @component()
        class MyComponent {
          private readonly css: Css;
          private readonly helloClassName: string;

          constructor() {
            this.css = new Css(window);

            this.helloClassName = this.css.style({
              '&': {
                background: 'black',
                color: 'red',
              }
            })
          }

          render() {
            return html`
            <div class="${this.helloClassName}">Hello, World!</div>
          `
          }
        }

        renderComponent(document.body, new MyComponent());

        expect(screen.getByText('Hello, World!')).toHaveStyle('background: black');
        expect(screen.getByText('Hello, World!')).toHaveStyle('color: red');
      });

      it('renders the base style with camel case - attribute', () => {
        @component()
        class MyComponent {
          private readonly css: Css;
          private readonly helloClassName: string;

          constructor() {
            this.css = new Css(window);

            this.helloClassName = this.css.style({
              '&': {
                backgroundColor: 'black',
                color: 'red',
              }
            })
          }

          render() {
            return html`
            <div class="${this.helloClassName}">Hello, World!</div>
          `
          }
        }

        renderComponent(document.body, new MyComponent());

        expect(screen.getByText('Hello, World!')).toHaveStyle('background-color: black');
        expect(screen.getByText('Hello, World!')).toHaveStyle('color: red');
      });

      it('has transformations', () => {
        @component()
        class MyComponent {
          private readonly css: Css;
          private readonly helloClassName: string;

          constructor() {
            this.css = new Css(window);

            this.helloClassName = this.css.style({
              '& a': {
                color: 'blue'
              }
            });
          }

          render() {
            return html`
            <div class="${this.helloClassName}"><a href="#">Hello, World!</a></div>
          `
          }
        }

        renderComponent(document.body, new MyComponent());
        expect(screen.getByText('Hello, World!')).toHaveStyle('color: blue');
      });

      it('has media queries', () => {
        // .toHaveStyle does not supports media queries
        // That's why this test is expecting the generated css

        const css = new Css(window);

        const myClass = css.style({
          '&': {
            background: 'black',
            color: 'red',
          },
          '@media': {
            'screen and (min-width: 700px)': {
              '&': {
                color: 'blue'
              }
            }
          }
        });

        expect(document.head.innerHTML).toContain(`@media screen and (min-width: 700px) {.${myClass}{color: blue}}`);
      });

      describe('error handling', () => {
        it('throws an error if the selector does not starts with & - attribute', () => {
          this.css = new Css(window);

          expect(() => {
            this.css.style({
              '&': `
                  background: black;
                  color: red;
                `,
              'a': 'color: blue;'
            });
          }).toThrow(new Error('The selector must starts with "&". Found: "a".'));
        });

        it('throws an error the given media query is not an array', () => {
          this.css = new Css(window);

          expect(() => {
            this.css.style({
              '@media': 'color: blue;'
            });
          }).toThrow(new Error('The @media selector must be an object. Found: "string".'));
        });
      });
    });
  });

  describe('template based', () => {
    it('renders the css property', async () => {
      @component()
      class MyComponent {
        private readonly helloClassName = css`
          & {
            background: black;
            color: red;
          }
        `;
        private readonly byeClassName = css`
          & {
            background: red;
            color: black;
          }
        `;

        render() {
          return html`
            <div class="${this.helloClassName}">Hello, World!</div>
            <div class="${this.byeClassName}">Bye!</div>
          `
        }
      }

      renderComponent(document.body, new MyComponent());

      expect(screen.getByText('Hello, World!')).toHaveStyle('background: black');
      expect(screen.getByText('Hello, World!')).toHaveStyle('color: red');
      expect(screen.getByText('Bye!')).toHaveStyle('background: red');
      expect(screen.getByText('Bye!')).toHaveStyle('color: black');
    });
  });

  it('prevents equal classes to be created', async () => {
    const helloClassName = css`
      & {
        background: black;
        color: red
      }
    `;
    const byeClassName = css`
      & {
        background: ${'black'};
        color: ${'red'}
      }
    `;

    expect(helloClassName.jigLazyRun(document)).toBe(byeClassName.jigLazyRun(document));
    expect(document.documentElement.outerHTML.match(new RegExp(helloClassName.jigLazyRun(document), 'g'))).toHaveLength(1);
  });

  it('prevents same class to be evaluated twice', async () => {
    jest.spyOn(jigcss, '_jigcss');

    const helloClassName = css`
      & {
        background: black;
        color: red
      }
    `;

    helloClassName.jigLazyRun(document);
    helloClassName.jigLazyRun(document);

    expect(jigcss._jigcss).toBeCalledTimes(1);

  });

  it('prevents amp character replaced inside a content', async () => {
    (css`
      & {
        content: 'keep \& \& look'
      }
    `).jigLazyRun(document);
    
    expect(document.documentElement.outerHTML.match(/keep & & look/)).toHaveLength(1);
  });
})
