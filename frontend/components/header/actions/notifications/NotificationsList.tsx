"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Notification } from '@/types/user/Notification';

interface Params {
    notifications: Notification[]
}

function NotificationsList({ notifications }: Params) {
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

    const readNotification = async (notification: Notification) => {
        setActiveNotification(notification);
        if (!notification.isRead) {
            await fetch(`/api/notification/read/${notification.id}`, {
                method: "PATCH",
            });
        }
    }

    return (
        <>
            {notifications.map((n, i) => {
                let text = n.text.length > 30 ? n.text.substring(0, 27) + '...' : n.text;

                return (
                    <div
                        key={i}
                        onClick={() => readNotification(n)}
                        className="w-full flex items-center cursor-pointer relative p-2 hover:bg-background"
                    >
                        <div>{text}</div>
                        {!n.isRead && <div className="absolute right-2 rounded-full w-1.5 h-1.5 bg-primary" />}
                    </div>
                );
            })}

            <Dialog
                open={activeNotification !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) setActiveNotification(null);
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Notification</DialogTitle>
                        <DialogDescription className="text-base">
                            {activeNotification?.text}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default NotificationsList;