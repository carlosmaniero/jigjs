import {Counter} from "./counter";
import {renderComponent} from 'jigjs/components'
import {screen} from "@testing-library/dom";

describe('Counter', () => {
    it('renders initial number', () => {
        const counter = new Counter();

        renderComponent(document.body, counter);

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('increases the number when click at plus button', async () => {
        const counter = new Counter();

        renderComponent(document.body, counter);

        screen.getByText('+').click();

        expect(await screen.findByText('1')).toBeInTheDocument();
    });

    it('decreases the number when click at minus button', async () => {
        const counter = new Counter();

        renderComponent(document.body, counter);

        screen.getByText('-').click();

        expect(await screen.findByText('-1')).toBeInTheDocument();
    });
});
