import '../../../core/register';
import {BrowserContentRender} from "../browser/browser-content-render";

describe('Browser Content Render', () => {
    const getElement = (element) => {
        const div = document.createElement('div');
        while (element.childNodes.length !== 0) {
            div.appendChild(element.childNodes[0]);
        }
        return div;
    }

    it('renders a div with the content', () => {
        const html = `<div>Hello, world!</div>`;

        const element = new BrowserContentRender().render(html);

        expect(getElement(element).innerHTML).toContain(html);
    });

    it('recreates the script to prevent browsers to block them', () => {
        const html = `<script src="http://localhost/"></script><script src="http://localhost/2"></script>`;

        const element = new BrowserContentRender().render(html);
        const divElement = getElement(element);
        expect(divElement.querySelectorAll('script')).toHaveLength(2);
        expect(divElement.innerHTML).toContain('<script jig-joy-checked="true" src="http://localhost/"></script>');
        expect(divElement.innerHTML).toContain('<script jig-joy-checked="true" src="http://localhost/2"></script>');
    });

    it('recreates the body', () => {
        const html = `<script>console.log('hi')</script>`;

        const element = new BrowserContentRender().render(html);

        expect(getElement(element).innerHTML).toContain('<script jig-joy-checked="true">console.log(\'hi\')</script>');
    });
});
