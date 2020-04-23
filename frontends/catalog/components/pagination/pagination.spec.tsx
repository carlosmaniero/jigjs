import React from "react";

import {render} from "@testing-library/react";
import {Pagination} from "./pagination";

describe('Pagination', () => {
    describe('rendering control', () => {
        it('renders number indicators', async () => {
            const component = await render(<Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />);

            expect(component.queryByText('2 of 3')).not.toBeNull();
        });

        it('renders the next and previous link', async () => {
            const component = await render(<Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />);

            expect(component.queryByText('Previous')).not.toBeNull();
            expect(component.queryByText('Next')).not.toBeNull();
        });

        it('does not renders the previous link at the first page', async () => {
            const component = await render(<Pagination currentPage={1} totalPages={2} onPageChange={() => {}} />);

            expect(component.queryByText('Previous')).toBeNull();
        });

        it('does not renders the next link at the first page', async () => {
            const component = await render(<Pagination currentPage={2} totalPages={2} onPageChange={() => {}} />);

            expect(component.queryByText('Next')).toBeNull();
        });
    });

    describe('handling events', () => {
        it('handle previous click', async () => {
            const pageChangeStub = jest.fn();
            const component = await render(<Pagination currentPage={2} totalPages={3} onPageChange={pageChangeStub} />);

            component.getByText('Previous').click();

            expect(pageChangeStub).toBeCalledWith(1);
        });

        it('handle next click', async () => {
            const pageChangeStub = jest.fn();
            const component = await render(<Pagination currentPage={2} totalPages={3} onPageChange={pageChangeStub} />);

            component.getByText('Next').click();

            expect(pageChangeStub).toBeCalledWith(3);
        });
    })
})
