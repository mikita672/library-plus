import { Suspense } from 'react';
import AuthorFilter from './filters/author/AuthorFilter';
import FilterLoading from './filters/FilterLoading';
import PublisherFilter from './filters/publisher/PublisherFilter';

function FiltersSideBar() {
    return (
        <div className="col-span-2 p-2 bg-background flex flex-col gap-4">
            <p className="font-bold">Filters</p>

            <Suspense fallback={<FilterLoading name="authors" />}>
                <AuthorFilter />
            </Suspense>

            <Suspense fallback={<FilterLoading name="publishers" />}>
                <PublisherFilter />
            </Suspense>
        </div>
    )
}

export default FiltersSideBar