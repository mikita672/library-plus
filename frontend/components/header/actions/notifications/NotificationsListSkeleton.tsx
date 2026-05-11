import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'

function NotificationsListSkeleton() {
    return Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
            <Skeleton className="h-7 w-full" />
        </div>
    ));
}

export default NotificationsListSkeleton