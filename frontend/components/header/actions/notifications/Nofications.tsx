"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { BellIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react';
import NotificationsList from './NotificationsList';
import { Notification } from '@/types/user/Notification';
import NotificationsFooter from './NotificationsFooter';

function HeaderNotifications() {
    const [notifications, setNotifications] = useState<Notification[] | null>(null);
    const [pagesCount, setPagesCount] = useState(0);
    const [notReadCount, setNotReadCount] = useState(0);
    const [page, setPage] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/user/notifications/count");
            if (!response.ok) {
                return;
            }
            const { pagesCount, notReadCount } = await response.json();
            setPagesCount(pagesCount);
            setNotReadCount(notReadCount);
            if (pagesCount > 0) {
                setPage(1);
            }
        })()
    }, []);

    useEffect(() => {
        if (page === -1) {
            return;
        }
        const params = new URLSearchParams({
            pageNumber: page.toString()
        });

        (async () => {
            setIsLoading(true);
            const response = await fetch(`/api/user/notifications?${params}`);
            if (!response.ok) {
                setIsLoading(false);
                return;
            }
            const data = await response.json();
            setNotifications(data);
            setIsLoading(false);
        })()
    }, [page]);

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer" title="Notifications">
                    <BellIcon className="w-6 h-6 text-foreground transition-colors hover:text-gray-400" />
                    <div className="select-none absolute -bottom-1 -right-2 bg-destructive rounded-full w-4 h-4 text-xs text-center">
                        {notReadCount}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" sideOffset={10} className="w-60">
                {isLoading ? <div className="p-4 w-full flex justify-center align-center"><Spinner /></div> :
                    (
                        (notifications === null || pagesCount === 0) ?
                            <div className="p-4 w-full flex justify-center align-center">
                                No notifications
                            </div> :
                            <>
                                <NotificationsList notifications={notifications} />
                                <DropdownMenuSeparator />
                                <NotificationsFooter page={page} pagesCount={pagesCount} />
                            </>
                    )
                }
            </DropdownMenuContent>
        </DropdownMenu >
    )
}

export default HeaderNotifications