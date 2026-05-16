"use client"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination'

interface Props {
    page: number,
    pagesCount: number
}

function PageSelection({ page, pagesCount }: Props) {
    const startPage = page === 1 ? 1 : page - 1;
    const length = Math.min(pagesCount - startPage + 1, 3);

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" />
                </PaginationItem>
                {Array.from({ length }).map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink href="#">{startPage + i}</PaginationLink>
                    </PaginationItem>
                ))}
                {startPage + 2 === pagesCount ? <></> : <>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">{pagesCount}</PaginationLink>
                    </PaginationItem>
                </>}
                <PaginationItem>
                    <PaginationNext href="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export default PageSelection