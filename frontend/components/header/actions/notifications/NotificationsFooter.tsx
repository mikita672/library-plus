"use client"

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import React from 'react'

interface Props {
    pagesCount: number;
    page: number;
}

function NotificationsFooter({ pagesCount, page }: Props) {
    return <DropdownMenuItem className="w-full flex justify-between p-2">
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink isActive>
                        {page} / {pagesCount}
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </DropdownMenuItem>
}

export default NotificationsFooter