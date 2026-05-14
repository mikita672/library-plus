import { Suspense } from 'react';
import AuthorFilter from './filters/author/AuthorFilter';
import FilterLoading from './filters/Loading';

function FiltersSideBar() {
    return (
        <div className="col-span-2 p-2 bg-background flex flex-col gap-4">
            <p className="font-bold">Filters</p>

            <Suspense fallback={<FilterLoading name="authors" />}>
                <AuthorFilter />
            </Suspense>
        </div>
    )
}

export default FiltersSideBar