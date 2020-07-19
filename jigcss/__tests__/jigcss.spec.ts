import { screen } from "@testing-library/dom";
import { component, html, renderComponent } from "jigjs/components";
import { css } from "../";

describe('jigcss', () => {
  const waitForPromises = () => new Promise((resolve) => setImmediate(resolve));

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

  it('prevents amp character replaced inside a content', async () => {
    (css`
      & {
        content: 'keep \& \& look'
      }
    `).jigLazyRun(document);
    
    expect(document.documentElement.outerHTML.match(/keep & & look/)).toHaveLength(1);
  });
})
