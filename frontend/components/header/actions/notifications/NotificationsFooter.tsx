"use client"

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Props {
    pagesCount: number;
    page: number;
}

function NotificationsFooter({ pagesCount, page }: Props) {
    return <div className="w-full flex justify-center p-2">
        <Pagination>
            <PaginationContent>
                <PaginationItem className={page === 1 ? 'opacity-30' : ''}>
                    <PaginationPrevious />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink isActive>
                        {page} / {pagesCount}
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem className={page === pagesCount ? 'opacity-30' : ''}>
                    <PaginationNext />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>
}

export default NotificationsFooter