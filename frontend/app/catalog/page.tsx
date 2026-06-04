import BookResults from '@/components/catalog/book-results/BookResults'
import FiltersSideBar from '@/components/catalog/FiltersSideBar'
import ResultsPagination from '@/components/catalog/results-pagination/ResultsPagination';
import SearchBar from '@/components/catalog/SearchBar'
import SortSelection from '@/components/catalog/SortSelection';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function Catalog({ searchParams }: Props) {
    const params = new URLSearchParams();
    Object.entries(await searchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else if (value) {
            params.append(key, value);
        }
    });

    return (
        <div className="min-h-[70vh] w-full bg-card p-4 flex flex-col gap-4">
            <SearchBar />

            <div className="w-full grid grid-cols-12 gap-4 items-start">
                <div className="col-span-2">
                    <FiltersSideBar />
                </div>

                <div className="col-span-10 flex flex-col gap-4 justify-center">
                    <div className="w-full grid grid-cols-12 items-center">
                        <div className="col-span-4 flex items-center gap-2">
                            <span>Sort by</span>
                            <SortSelection />
                        </div>
                    </div>

                    <BookResults params={params} />

                    <ResultsPagination params={params} />
                </div>
            </div>
        </div>
    )
}

export default Catalog