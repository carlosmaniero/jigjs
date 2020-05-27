import '../../../core/register';
import {ServerContentRender} from "../server/server-content-render";

describe('Server Content Render', () => {
    const getElement = (element) => {
        const div = document.createElement('div');
        while (element.childNodes.length !== 0) {
            div.appendChild(element.childNodes[0]);
        }
        return div;
    }

    it('renders a div with the content', () => {
        const html = `<div>Hello, world!</div>`;

        const element = new ServerContentRender().render(html);

        expect(getElement(element).innerHTML).toBe(html);
    });

    it('does not renders script', () => {
        const html = `<script src="http://localhost/"></script><script src="http://localhost/2"></script>`;

        const element = new ServerContentRender().render(html);
        const divElement = getElement(element);
        expect(divElement.querySelectorAll('script')).toHaveLength(0);
    });
});
