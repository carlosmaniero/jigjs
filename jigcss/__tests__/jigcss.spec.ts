import {Css} from "../";
import {component, html, renderComponent} from "jigjs/components";
import {screen} from "@testing-library/dom";
import {observing} from "jigjs/reactive";

describe('jigcss', () => {
  const waitForPromises = () => new Promise((resolve) => setImmediate(resolve));

  it('renders the css property', () => {
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
        this.css = new Css();
      }

      render() {
        return html`
          ${this.css}
          
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
    it('prevent equal classes to be created', () => {
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
          background: black;
          color: red;
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

      renderComponent(document.body, new MyComponent());

      expect(screen.getByText('Hello, World!'))
        .toHaveClass(screen.getByText('Bye!').className);
    });
  });
})
