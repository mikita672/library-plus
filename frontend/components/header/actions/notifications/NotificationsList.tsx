"use client";

import { Notification } from '@/types/user/Notification';

interface Params {
    notifications: Notification[]
}

function NotificationsList({ notifications }: Params) {
    const notificationElements = notifications.map((n, i) => {
        let text = n.text;
        if (n.text.length > 30) {
            n.text = n.text.substring(0, 27) + '...';
        }

        return (
            <div className="w-full flex items-center cursor-pointer relative p-2 hover:bg-background" key={i}>
                <div>{text}</div>
                {n.isRead ? <></> : <div className="absolute right-2 rounded-full w-1.5 h-1.5 bg-primary" />}
            </div>
        )
    })

    return notificationElements;
}

export default NotificationsList