import BookResults from '@/components/catalog/BookResults'
import FiltersSideBar from '@/components/catalog/FiltersSideBar'
import ResultsPagination from '@/components/catalog/results-pagination/ResultsPagination';
import SearchBar from '@/components/catalog/SearchBar'

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
        <div className="min-h-[60vh] w-full bg-card p-4 flex flex-col gap-4">
            <SearchBar />

            <div className="w-full grid grid-cols-12 gap-4 items-start">
                <div className="col-span-2">
                    <FiltersSideBar />
                </div>

                <div className="col-span-10 flex flex-col gap-4 justify-center">
                    <BookResults params={params} />

                    <ResultsPagination params={params} />
                </div>
            </div>
        </div>
    )
}

export default Catalog