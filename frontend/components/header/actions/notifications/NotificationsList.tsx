"use client"

import React, { useState } from 'react'
import { Notification } from '@/types/user/Notification';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Params {
    notifications: Notification[];
}

function NotificationsList({ notifications }: Params) {
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

    const readNotification = async (notification: Notification) => {
        setActiveNotification(notification);
        if (!notification.isRead) {
            await fetch(`/api/notifications/read/${notification.id}`, {
                method: "PATCH",
            });
        }
    }

    return (
        <>
            {notifications.map((n, i) => {
                return (
                    <div
                        key={i}
                        onClick={() => readNotification(n)}
                        className="w-full flex items-center cursor-pointer relative p-2 hover:bg-background"
                    >
                        <div>Notification</div>
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
                    <DialogFooter className="w-full flex items-center justify-between!">
                        <div className={activeNotification?.createdAt ? '' : 'invisible'}>
                            Notification from: {
                                activeNotification?.createdAt ?
                                    new Date(activeNotification.createdAt).toLocaleString() : ''
                            }
                        </div>

                        <DialogClose asChild>
                            <Button className="cursor-pointer" type="button">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default NotificationsList
