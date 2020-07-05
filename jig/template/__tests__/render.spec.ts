import {html, HTMLElementWithJigProperties, render} from "../render";

describe('Render', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders a simple text', () => {
        render(html`Hey`)(document.body);


        expect(document.body.textContent).toBe('Hey');
    });

    it('ignores null values', () => {
        render(html`${null}Hi`)(document.body);

        expect(document.body.textContent).toBe('Hi');
    });

    it('ignores undefined values', () => {
        render(html`${undefined}Hi`)(document.body);

        expect(document.body.textContent).toBe('Hi');
    });


    it('does not ignores zeros', () => {
        render(html`0${0}0`)(document.body);

        expect(document.body.textContent).toBe('000');
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

    describe('nested html', () => {
        it('renders a nested html list', () => {
            render(html`
                ${html`a`} ${[html`b`]} ${[html`c`]} ${[html`d`, html`e`]} ${['f', 'g', 123]} ${html`${html`4`}`}`)(document.body);

            expect(document.body.textContent).toContain('a b c de fg123 4');
        });

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

        it('fills object attribute', () => {
            const attrs = {
                class: 'hi',
                id: 'my-id'
            };

            render(html`<div ${attrs}></div>`)(document.body);

            const element = document.body.querySelector('div');

            expect(element.className).toBe('hi');
            expect(element.id).toBe('my-id');
            expect(element.getAttributeNames()).toHaveLength(2);
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

    describe('diffing dom', () => {
       it('keeps not changed elements', () => {
           const greeting = 'Hello';
           let name = 'World';

           render(html`<strong>${greeting} <i>${name}</i></strong>`)(document.body);
           const strong = document.body.querySelector('strong');
           const italic = document.body.querySelector('i');
           name = 'Universe';
           render(html`<strong>${greeting} <i>${name}</i></strong>`)(document.body);

           expect(strong).toBe(document.body.querySelector('strong'));
           expect(italic).toBe(document.body.querySelector('i'));
           expect(italic.textContent).toBe('Universe');
       });

       it('binds events if they does not exists', () => {
           const mock = jest.fn();
           const mock2 = jest.fn();

           render(html`
                <div>
                    <button>Hit me!</button>
                </div>
            `)(document.body);

           render(html`
                <div>
                    <button onclick="${mock}">Hit me!</button>
                </div>
            `)(document.body);

           const buttonElement = document.querySelector('button');
           buttonElement.click();

           expect(buttonElement.hasAttribute('onclick')).toBeFalsy();
           expect(mock).toBeCalled();

           render(html`
                <div>
                    <button onclick="${mock2}">Hit me!</button>
                </div>
            `)(document.body);

           buttonElement.click();
           expect(mock2).toBeCalled();
           expect(mock).toBeCalledTimes(1);
       });


        it('binds new props', () => {
            render(html`
                <div>
                    <button>Hit me!</button>
                </div>
            `)(document.body);

            render(html`
                <div>
                    <button @prop="cool!">Hit me!</button>
                </div>
            `)(document.body);

            const buttonElement = document.querySelector('button');
            expect((buttonElement as HTMLElementWithJigProperties).props.prop).toBe('cool!');
        });

        it('prevents to rerender given a should render function', () => {
            render(html`
                <div>
                    <button>Hit me!</button>
                </div>
            `)(document.body);

            const div = document.querySelector('div');

            const shouldUpdateMock = jest.fn().mockImplementation(() => false);

            (div as HTMLElementWithJigProperties).shouldUpdate = shouldUpdateMock;

            render(html`
                <div>
                    <i>I changed</i>
                </div>
            `)(document.body);

            const buttonElement = document.querySelector('button');
            expect(buttonElement).toBeTruthy();
            expect(shouldUpdateMock.mock.calls[0][0].textContent).toContain('I changed');
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

            const divElement: HTMLElementWithJigProperties = document.querySelector('div');
            expect(divElement.props.props1).toBe(props1);
            expect(divElement.props.props2).toBe(props2);
            expect(divElement.props.props3).toBe(props3);
            expect(divElement.getAttributeNames()).toEqual([]);
        });

        it('adds static props', () => {
            render(html`
                <div 
                    @props1="1" 
                    @props2="Hi"></div>
            `)(document.body);

            const divElement: HTMLElementWithJigProperties = document.querySelector('div');
            expect(divElement.props.props1).toBe('1');
            expect(divElement.props.props2).toBe('Hi');
            expect(divElement.getAttributeNames()).toEqual([]);
        });

        it('adds props with static content', () => {
            const prop = "Socrates";
            const greatestTeamInTheWorld = 'Corinthians';

            render(html`<div @prop="Hi ${prop} of ${greatestTeamInTheWorld}!"></div>`)(document.body);

            const divElement: HTMLElementWithJigProperties = document.querySelector('div');
            expect(divElement.props.prop).toBe('Hi Socrates of Corinthians!');
            expect(divElement.getAttributeNames()).toEqual([]);
        });
    });

    describe('connecting hooks', () => {
        it('calls connect when the element is appended to the document', () => {
            const element: HTMLElementWithJigProperties = document.createElement('div');
            element.onConnect = jest.fn();
            render(element)(document.body);

            expect(element.onConnect).toBeCalled();
        });

        it('does calls connect when the element is appended to a non attached object to document', () => {
            const element: HTMLElementWithJigProperties = document.createElement('div');
            element.onConnect = jest.fn();

            const bindElement = document.createElement('div');
            render(element)(bindElement);

            expect(element.onConnect).not.toBeCalled();
        });

        it('calls disconnect when the element is removed from the document', () => {
            const element: HTMLElementWithJigProperties = document.createElement('div');
            element.onDisconnect = jest.fn();
            render(element)(document.body);
            expect(element.onDisconnect).not.toBeCalled();
            render(document.createElement('strong'))(document.body);

            expect(element.onDisconnect).toBeCalled();
        });

        it('calls disconnect when a parent element is removed', () => {
            const parentElement = document.createElement('div');
            const element: HTMLElementWithJigProperties = document.createElement('div');
            element.onDisconnect = jest.fn();
            parentElement.appendChild(element);
            render(parentElement)(document.body);
            expect(element.onDisconnect).not.toBeCalled();
            render(document.createElement('strong'))(document.body);

            expect(element.onDisconnect).toBeCalled();
        });

        it('does not calls disconnect when the element is removed from a non attached object to document', () => {
            const bindElement = document.createElement('div');
            const element: HTMLElementWithJigProperties = document.createElement('div');

            element.onDisconnect = jest.fn();

            render(element)(bindElement);
            render(document.createElement('strong'))(bindElement);

            expect(element.onDisconnect).not.toBeCalled();
        });
    });
});
