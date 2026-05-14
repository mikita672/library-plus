import { Author } from '@/types/book/Author';
import React from 'react'
import AuthorFilter from './AuthorFilter';

async function FiltersSideBar() {
    const authors: Author[] = await (await fetch(`${process.env.API_URL}/author`, {
        method: "GET",
    })).json();

    return (
        <div className="col-span-2 p-2 bg-background flex flex-col gap-4">
            <p className="font-bold">Filters</p>

            <AuthorFilter authors={authors} />
        </div>
    )
}

export default FiltersSideBar