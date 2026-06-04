"use client"

import { Skeleton } from "../ui/skeleton"

function BookEntriesSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full grid grid-cols-4 items-center gap-24 bg-background p-4">
                    <div className="col-span-3 flex items-center gap-4">
                        <Skeleton className="w-[128px] h-[128px]" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-[200px]" />
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[160px]" />
                                <Skeleton className="h-4 w-[175px]" />
                                <Skeleton className="h-4 w-[64px]" />
                            </div>
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