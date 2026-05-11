"use client";

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Notification } from '@/types/user/Notification';
import React from 'react'

interface Params {
    notifications: Notification[]
}

function NotificationsList({ notifications }: Params) {
    const notificationElements = notifications.map((n, i) => {
        let text = n.text;
        if (n.text.length > 24) {
            n.text = n.text.substring(0, 21) + '...';
        }

        return <DropdownMenuItem className="w-full cursor-pointer relative p-2">
            <div>{text}</div>
            {n.isRead ? <></> : <div className="absolute right-4 rounded-full w-2 h-2 bg-primary" />}
        </DropdownMenuItem>
    })

    return notificationElements;
}

export default NotificationsList