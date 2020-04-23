import React from "react";

interface Props {
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void;
}

interface PaginationLinkProps {
    page: number,
    label: string,
    onPageChange: (page: number) => void;
}

const PaginationLink = ({label, page, onPageChange}: PaginationLinkProps) =>
    <>
        <style jsx>{`
          a {
            background: #ee8329;
            color: #ffffff;
            text-decoration: none;
            padding: 5px 10px;
            font-family: sans-serif;
            margin-right: 10px;
          }
    `}</style>
        <a href="#" onClick={(e) => {
            e.preventDefault();

            onPageChange(page)
        }}>{label}</a>
    </>

export const Pagination = ({currentPage, totalPages, onPageChange}: Props) => <div>
    <style jsx>{`
        * {
          margin-right: 10px;
          font-family: sans-serif;
        }
    `}</style>
    {currentPage != 1 && <PaginationLink onPageChange={onPageChange} label="Previous" page={currentPage - 1} />}

    <span>{currentPage} of {totalPages}</span>

    {currentPage != totalPages && <PaginationLink onPageChange={onPageChange} label="Next" page={currentPage + 1} />}
</div>
