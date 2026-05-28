"use client"

import { Skeleton } from "../ui/skeleton"

function BookEntriesSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full flex items-center gap-24 bg-background p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-[100px] h-[100px]" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[175px]" />
                            <Skeleton className="h-4 w-[64px]" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Skeleton className="h-[32px] w-[100px]" />
                        <Skeleton className="h-[32px] w-[32px]" />
                    </div>
                </div>
            ))}
        </>
    )
}

export default BookEntriesSkeleton