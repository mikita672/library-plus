import BookResults from '@/components/catalog/BookResults'
import FiltersSideBar from '@/components/catalog/filters/FiltersSideBar'
import SearchBar from '@/components/catalog/SearchBar'
import React from 'react'

function Catalog() {
    return (
        <div className="min-h-[60vh] w-full bg-card p-2 flex flex-col gap-2">
            <SearchBar />

            <div className="w-full grid grid-cols-12 gap-2">
                <FiltersSideBar />

                <BookResults />
            </div>
        </div>
    )
}

export default Catalog