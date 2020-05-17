import React from "react";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    paginationUrlTemplate: string;
}

interface PaginationLinkProps {
    page: number;
    label: string;
    title: string;
    onPageChange: (page: number) => void;
    paginationUrlTemplate: string;
}

const PaginationLink = ({label, title, page, onPageChange, paginationUrlTemplate}: PaginationLinkProps) =>
    <>
        <style jsx>{`
            a {
                background: linear-gradient(90deg, rgba(48,77,102,0) 0%, rgba(48,77,102,1) 100%);
                color: #35516c;
                text-decoration: none;
                padding: 5px 10px;
                font-family: sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                text-shadow: 2px 2px 0 #1E3040;
            }
            a:first-child {
              background: linear-gradient(90deg, rgba(48,77,102,1) 0%, rgba(48,77,102,0) 100%);
            }
        `}</style>
        <a href={paginationUrlTemplate.replace('{number}', page.toString())} title={title} onClick={(e) => {
            if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) {
                return;
            }
            e.preventDefault();

            onPageChange(page)
        }}>{label}</a>
    </>

export const Pagination = ({currentPage, totalPages, onPageChange, paginationUrlTemplate}: Props) => <>
    <style jsx>{`
        span {
          font-family: sans-serif;
          color: #35516c;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        div {
          display: grid;
          grid-template-columns: 3fr 4fr 3fr;
          border: 4px solid #1E3040;
          border-radius: 20px;
          color: #35516c;
          text-align: center;
          font-family: sans-serif;
          position: relative;
          box-shadow: 5px 5px #1E3040;
          overflow: hidden;
        }
    `}</style>
    <div>
        {currentPage != 1 && <PaginationLink
            label="◀"
            title="Previous"
            paginationUrlTemplate={paginationUrlTemplate}
            onPageChange={onPageChange}
            page={currentPage - 1}/>}

        {currentPage == 1 && <span></span>}

        <span>{currentPage} of {totalPages}</span>

        {currentPage != totalPages && <PaginationLink
            paginationUrlTemplate={paginationUrlTemplate}
            onPageChange={onPageChange}
            label="▶"
            title="Next"
            page={currentPage + 1}/>}
    </div>
</>
