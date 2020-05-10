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

    describe('filling attributes', () => {
        it('fills basic attributes', () => {
            const className = 'my-class-name';

            render(html`<div class="${className}"></div>`)(document.body);

            const element = document.body.querySelector('div');

            expect(element.className).toBe('my-class-name');
        });

        it('fills basic attributes recursively', () => {
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

        it('fills basic attributes with extra value', () => {
            const className = 'middle';

            render(html`
                <div class="initial ${className} ${'center'} final-4">
                </div>
            `)(document.body);

            const element = document.body.querySelector('div');

            expect(element.className).toBe('initial middle center final-4');
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

        it('logs an error if there are more then the placeholder into an event', () => {
            const mock = jest.fn();

            expect(() => {
                render(html`
                    <div>
                        <button onclick="${mock}ababa">Hit me!</button>
                    </div>
                `)(document.body);
            }).toThrowError('onclick must be a function it was "[function]ababa"');
        });

        it('logs an error if value is not a function', () => {
            expect(() => {
                render(html`
                    <div>
                        <button onclick="${1}">Hit me!</button>
                    </div>
                `)(document.body);
            }).toThrowError('onclick must be a function it was "number"');
        });
    });

    describe('handling props', () => {
        it('adds props', () => {

            const props1 = "Hi";
            const props2 = 10;
            const props3 = {x: 1};

            render(html`
                <div 
                    @props1="${props1}" 
                    @props2="${props2}"
                    @props3="${props3}"></div>
            `)(document.body);

            const divElement = document.querySelector('div');
            expect((divElement as any).props.props1).toBe(props1);
            expect((divElement as any).props.props2).toBe(props2);
            expect((divElement as any).props.props3).toBe(props3);
            expect(divElement.getAttributeNames()).toEqual([]);
        });

        it('adds props with static content', () => {
            const prop = "Socrates";
            const greatestTeamInTheWorld = 'Corinthians';

            render(html`<div @prop="Hi ${prop} of ${greatestTeamInTheWorld}!"></div>`)(document.body);

            const divElement = document.querySelector('div');
            expect((divElement as any).props.prop).toBe('Hi Socrates of Corinthians!');
        });
    });
});
