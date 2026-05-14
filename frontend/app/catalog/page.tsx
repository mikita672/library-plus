import BookResults from '@/components/catalog/BookResults'
import FiltersSideBar from '@/components/catalog/FiltersSideBar'
import SearchBar from '@/components/catalog/SearchBar'
import React from 'react'

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function Catalog({ searchParams }: Props) {
    return (
        <div className="min-h-[60vh] w-full bg-card p-4 flex flex-col gap-4">
            <SearchBar />

            <div className="w-full grid grid-cols-12 gap-4 items-start">
                <FiltersSideBar />

                <BookResults searchParams={searchParams} />
            </div>
        </div>
    )
}

export default Catalog