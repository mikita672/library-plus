"use client"

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dispatch, SetStateAction } from 'react';

interface Props {
    pagesCount: number;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
}

function NotificationsFooter({ pagesCount, page, setPage }: Props) {
    return <div className="w-full flex justify-center p-2">
        <Pagination>
            <PaginationContent>
                <PaginationItem className={page === 1 ? 'opacity-30' : ''}>
                    <PaginationPrevious onClick={() => {
                        if (page === 1) {
                            return;
                        }
                        setPage(prev => prev - 1);
                    }} />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink isActive>
                        {page} / {pagesCount}
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem className={page === pagesCount ? 'opacity-30' : ''}>
                    <PaginationNext onClick={() => {
                        if (page === pagesCount) {
                            return;
                        }
                        setPage(prev => prev + 1);
                    }} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>
}

export default NotificationsFooter