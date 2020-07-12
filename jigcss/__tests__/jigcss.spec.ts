import {Css} from "../";
import {component, html, renderComponent} from "jigjs/components";
import {screen} from "@testing-library/dom";
import {observing} from "jigjs/reactive";

describe('jigcss', () => {
  const waitForPromises = () => new Promise((resolve) => setImmediate(resolve));

  it('renders the css property', async () => {
    @component()
    class MyComponent {
      private readonly css: Css;
      private readonly helloClassName: string;
      private readonly byeClassName: string;

      constructor() {
        this.css = new Css(window);

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

  it('updates styles when a class is created', async () => {
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

    myComponent.helloClassName = myComponent.css.style('background: black');

    await waitForPromises();

    expect(screen.getByText('Hello, World!')).toHaveStyle('background: black');
  });

  describe('removing duplicated classes', () => {
    it('prevent equal classes to be created', async () => {
      @component()
      class MyComponent {
        private readonly css: Css;
        private readonly helloClassName: string;
        private readonly byeClassName: string;

        constructor() {
          this.css = new Css(window);
          this.helloClassName = this.css.style(`
          background: black;
          color: red;
        `);
          this.byeClassName = this.css.style(`
          background: black;
          color: red;
        `);
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
    it('renders the base style', () => {
      @component()
      class MyComponent {
        private readonly css: Css;
        private readonly helloClassName: string;

        constructor() {
          this.css = new Css(window);

          this.helloClassName = this.css.style({
            base: `
              background: black;
              color: red;
            `
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

    it('has transformations', () => {
      @component()
      class MyComponent {
        private readonly css: Css;
        private readonly helloClassName: string;

        constructor() {
          this.css = new Css(window);

          this.helloClassName = this.css.style({
            base: `
              background: black;
              color: red;
            `,
            '& a': 'color: blue;'
          });
        }

        render() {
          return html`
          <div class="${this.helloClassName}"><a href="#">Hello, World!</a></div>
        `
        }
      }

      renderComponent(document.body, new MyComponent());

      screen.getByText('Hello, World!').focus();
      expect(screen.getByText('Hello, World!')).toHaveStyle('color: blue');
    });

    it('throws an error if the transformation does not starts with &', () => {
      this.css = new Css(window);

      expect(() => {
        this.css.style({
          base: `
              background: black;
              color: red;
            `,
          'a': 'color: blue;'
        });
      }).toThrow(new Error('The style transformation must starts with "&". Found: "a".'));
    });
  });
})
