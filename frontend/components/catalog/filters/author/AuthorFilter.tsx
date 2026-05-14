import { Author } from '@/types/book/Author';
import AuthorFilterRadioGroup from './AuthorFilterRadioGroup';

async function AuthorFilter() {
    const response = await fetch(`${process.env.API_URL}/author`, {
        method: "GET",
    });

    if (!response.ok) {
        return <div className="text-destructive">Failed to fetch authors</div>
    }

    const authors: Author[] = await response.json();

    if (authors.length === 0) {
        return <></>;
    }

    return (
        <div className="flex flex-col gap-1">
            <p>Author</p>

            <AuthorFilterRadioGroup authors={authors} />
        </div>
    )
}

export default AuthorFilter