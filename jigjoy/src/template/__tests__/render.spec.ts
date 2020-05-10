import {html, render} from "../render";

describe('Render', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders a simple text', () => {
        render(html`Hey`)(document.body);


        expect(document.body.textContent).toBe('Hey');
    });

    it('renders a simple html tag', () => {
        render(html`<div class="my-class">Hey</div>`)(document.body);

        const element = document.body.querySelector('div');

        expect(element.textContent).toBe('Hey');
        expect(element.className).toBe('my-class');
    });

    describe('filling content', () => {
        it('renders the content', () => {
            const greeting = 'Hello';
            const name = 'World';

            render(html`<div>${greeting}, ${name}</div>`)(document.body);

            const element = document.body.querySelector('div');

            expect(element.textContent).toBe('Hello, World');
        });

        it('renders the content with sub element', () => {
            const greeting = 'Hello';
            const name = 'World';

            render(html`<div>${greeting}, <strong>${name}</strong></div>`)(document.body);

            expect(document.body.innerHTML).toBe('<div>Hello, <strong>World</strong></div>');
        });

        it('renders multiple elements', () => {
            const greeting = 'Hello';
            const name = 'World';

            render(html`<i>${greeting}</i>, <strong>${name}</strong>`)(document.body);

            expect(document.body.innerHTML).toBe('<i>Hello</i>, <strong>World</strong>');
        });

        it('does not adds extra placeholder', () => {
            const greeting = 'Hello';
            const name = 'World';

            render(html`<div>${greeting}, <strong>${name}</strong></div>
                `)(document.body);

            expect(document.body.innerHTML).not.toContain('placeholder');
        });
    });

    describe('listing', () => {
        it('renders a list', () => {
            const greetings = [
                'Hello',
                'Universe'
            ]

            render(html`
                <ul>
                    ${greetings.map((greeting) => html`<li>${greeting}</li>`)}
                </ul>
            `)(document.body);

            const liList = document.querySelectorAll('li');
            expect(liList).toHaveLength(2);
            expect(liList[0].textContent).toBe('Hello');
            expect(liList[1].textContent).toBe('Universe');
            expect(document.body.innerHTML).not.toContain('__render_placeholder');
        });

        it('renders a text list', () => {
            const greetings = [
                'Hello',
                'Universe'
            ]

            render(html`
                <div>${greetings}</div>
            `)(document.body);

            const element = document.querySelector('div');
            expect(element.textContent).toBe('HelloUniverse');
        });

        it('keeps other texts', () => {
            const greetings = [
                'World',
                'Universe'
            ]

            render(html`
                <div>
                    Hello${greetings.map((greeting) => html` <strong>${greeting}</strong>`)}!
                </div>
            `)(document.body);

            const list = document.querySelectorAll('strong');
            expect(list).toHaveLength(2);
            expect(list[0].textContent).toBe('World');
            expect(list[1].textContent).toBe('Universe');
            expect(document.body.querySelector('div').textContent).toContain('Hello World Universe!');
        });
    });

    describe('filling properties', () => {
        it('fills basic properties', () => {
            const className = 'my-class-name';

            render(html`<div class="${className}"></div>`)(document.body);

            const element = document.body.querySelector('div');

            expect(element.className).toBe('my-class-name');
        });

        it('fills basic properties recursively', () => {
            const className = 'my-class-name';
            const inputValue = 'my value'

            render(html`
                <div class="${className}">
                   <input value="${inputValue}" />
                </div>
            `)(document.body);

            const element = document.body.querySelector('div');

            expect(element.className).toBe('my-class-name');
            expect(element.querySelector('input').value).toBe(inputValue);
        });
    });

    describe('handling events', () => {
        it('adds click event', () => {
            const mock = jest.fn();

            render(html`
                <div>
                    <button onclick="${mock}">Hit me!</button>
                </div>
            `)(document.body);

            const buttonElement = document.querySelector('button');
            buttonElement.click();

            expect(buttonElement.hasAttribute('onclick')).toBeFalsy();
            expect(mock).toBeCalled();
        });
    });
});
