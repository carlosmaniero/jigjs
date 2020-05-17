import React from "react";

import {render} from "@testing-library/react";
import {Pagination} from "./pagination";

describe('Pagination', () => {
    describe('rendering control', () => {
        it('renders number indicators', async () => {
            const component = await render(<Pagination
                paginationUrlTemplate={"/{number}"}
                currentPage={2}
                totalPages={3}
                onPageChange={() => {}}
            />);

            expect(component.queryByText('2 of 3')).not.toBeNull();
        });

        it('renders the next and previous link', async () => {
            const component = await render(<Pagination
                paginationUrlTemplate={"/{number}"}
                currentPage={2}
                totalPages={3}
                onPageChange={() => {}}
            />);

            expect(component.queryByTitle('Previous')).not.toBeNull();
            expect(component.queryByTitle('Next')).not.toBeNull();
        });

        it('does not renders the previous link at the first page', async () => {
            const component = await render(<Pagination
                paginationUrlTemplate={"/{number}"}
                currentPage={1}
                totalPages={2}
                onPageChange={() => {}} />);

            expect(component.queryByTitle('Previous')).toBeNull();
        });

        it('does not renders the next link at the first page', async () => {
            const component = await render(<Pagination
                paginationUrlTemplate={"/{number}"}
                currentPage={2}
                totalPages={2}
                onPageChange={() => {}} />);

            expect(component.queryByTitle('Next')).toBeNull();
        });
    });

    describe('handling events', () => {
        it('handle previous click', async () => {
            const pageChangeStub = jest.fn();
            const component = await render(<Pagination
                paginationUrlTemplate={"/{number}"}
                currentPage={2} totalPages={3} onPageChange={pageChangeStub} />);

            component.getByTitle('Previous').click();

            expect(pageChangeStub).toBeCalledWith(1);
        });

        it('handle next click', async () => {
            const pageChangeStub = jest.fn();
            const component = await render(<Pagination
                paginationUrlTemplate={"/{number}"}
                currentPage={2}
                totalPages={3}
                onPageChange={pageChangeStub} />);

            component.getByTitle('Next').click();

            expect(pageChangeStub).toBeCalledWith(3);
        });
    })
})
