"use client"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination'

interface Props {
    pageNumber: number,
    pagesCount: number
}

function PageSelection({ pageNumber, pagesCount }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const startPage = pageNumber === 1 ? 1 : pageNumber - 1;
    const length = Math.min(pagesCount - startPage + 1, 3);

    const changePage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("pageNumber", nextPage.toString());
        router.replace(`${pathname}?${params.toString()}`);
        router.refresh();
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem className={pageNumber === 1 ? 'opacity-30' : 'cursor-pointer'}>
                    <PaginationPrevious onClick={() => {
                        if (pageNumber === 1) {
                            return;
                        }
                        changePage(pageNumber - 1);
                    }} />
                </PaginationItem>
                {Array.from({ length }).map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => {
                                changePage(startPage + i);
                            }}
                            isActive={pageNumber === (startPage + i)}
                        >{startPage + i}</PaginationLink>
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
                <PaginationItem className={pageNumber >= pagesCount ? 'opacity-30' : 'cursor-pointer'}>
                    <PaginationNext onClick={() => {
                        if (pageNumber >= pagesCount) {
                            return;
                        }
                        changePage(pageNumber + 1);
                    }} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export default PageSelection