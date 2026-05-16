import { Category } from '@/types/book/Category';
import CategoryFilterSelection from './CategoryFilterSelection';

async function CategoryFilter() {
    const response = await fetch(`${process.env.API_URL}/categories`, {
        method: "GET",
    });

    if (!response.ok) {
        return <div className="text-destructive">Failed to fetch categories</div>
    }

    const categories: Category[] = await response.json();

    if (categories.length === 0) {
        return <></>;
    }

    return (
        <div className="flex flex-col gap-1">
            <p>Category</p>

            <CategoryFilterSelection categories={categories} />
        </div>
    )
}

export default CategoryFilter