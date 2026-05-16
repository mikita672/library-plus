import { Suspense } from 'react';
import AuthorFilter from './filters/author/AuthorFilter';
import FilterLoading from './filters/FilterLoading';
import PublisherFilter from './filters/publisher/PublisherFilter';
import PublicationYearFilter from './filters/PublicationYearFilter';
import CategoryFilter from './filters/category/CategoryFilter';

function FiltersSideBar() {
    return (
        <div className="w-full p-2 bg-background flex flex-col gap-4">
            <p className="font-bold">Filters</p>

            <Suspense fallback={<FilterLoading name="authors" />}>
                <AuthorFilter />
            </Suspense>

            <Suspense fallback={<FilterLoading name="publishers" />}>
                <PublisherFilter />
            </Suspense>

            <PublicationYearFilter />

            <Suspense fallback={<FilterLoading name="categories" />}>
                <CategoryFilter />
            </Suspense>
        </div>
    )
}

export default FiltersSideBar