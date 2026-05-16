"use client"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination'

interface Props {
    page: number,
    pagesCount: number
}

function PageSelection({ page, pagesCount }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const startPage = page === 1 ? 1 : page - 1;
    const length = Math.min(pagesCount - startPage + 1, 3);

    const changePage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("pageNumber", nextPage.toString());
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem className={page === 1 ? 'opacity-30' : 'cursor-pointer'}>
                    <PaginationPrevious onClick={() => {
                        if (page === 1) {
                            return;
                        }
                        changePage(page - 1);
                    }} />
                </PaginationItem>
                {Array.from({ length }).map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink onClick={() => {
                            changePage(startPage + i);
                        }}>{startPage + i}</PaginationLink>
                    </PaginationItem>
                ))}
                {startPage + 2 >= pagesCount ? <></> : <>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink onClick={() => {
                            changePage(pagesCount);
                        }}>{pagesCount}</PaginationLink>
                    </PaginationItem>
                </>}
                <PaginationItem className={page === pagesCount ? 'opacity-30' : 'cursor-pointer'}>
                    <PaginationNext onClick={() => {
                        if (page === pagesCount) {
                            return;
                        }
                        changePage(page + 1);
                    }} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export default PageSelection