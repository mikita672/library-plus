import { BookPreview } from '@/types/book/Book'
import Link from 'next/link';
import { Badge } from '../ui/badge';
import AddToCardButton from './AddToCardButton';
import BookMainInformation from './BookMainInformation';

interface Props {
    book: BookPreview;
}

function BookInformation({ book }: Props) {
    return (
        <div className="w-full flex flex-col gap-4">
            <BookMainInformation book={book} />
        </div>
    )
}

export default BookInformation