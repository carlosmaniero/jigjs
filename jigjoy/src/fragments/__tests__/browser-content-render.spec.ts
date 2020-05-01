import '../../core/register';
import {BrowserContentRender} from "../browser-content-render";

describe('Browser Content Render', () => {
    it('renders a div with the content', () => {
        const html = `<div>Hello, world!</div>`;

        const element = new BrowserContentRender().render(html);

        expect(element.innerHTML).toContain(html);
    });

    it('recreates the script to prevent browsers to block them', () => {
        const html = `<script src="http://localhost/"></script><script src="http://localhost/2"></script>`;

        const element = new BrowserContentRender().render(html);

        expect(element.querySelectorAll('script')).toHaveLength(2);
        expect(element.innerHTML).toContain('<script jig-joy-checked="true" src="http://localhost/"></script>');
        expect(element.innerHTML).toContain('<script jig-joy-checked="true" src="http://localhost/2"></script>');
    });

    it('recreates the body', () => {
        const html = `<script>console.log('hi')</script>`;

        const element = new BrowserContentRender().render(html);

        expect(element.innerHTML).toContain('<script jig-joy-checked="true">console.log(\'hi\')</script>');
    });
});
