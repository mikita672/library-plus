"use client";

import { DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Notification } from '@/types/user/Notification';
import React from 'react'

interface Params {
    notifications: Notification[]
}

function NotificationsList({ notifications }: Params) {
    const notificationElements = notifications.map((n, i) => {
        let text = n.text;
        if (n.text.length > 30) {
            n.text = n.text.substring(0, 27) + '...';
        }

        return <DropdownMenuItem className="w-full cursor-pointer relative p-2" key={i}>
            <div>{text}</div>
            {n.isRead ? <></> : <div className="absolute right-4 rounded-full w-1.5 h-1.5 bg-primary" />}
        </DropdownMenuItem>
    })

    return notificationElements;
}

export default NotificationsList