import { BookPreview } from '@/types/book/Book'
import Link from 'next/link';
import { Badge } from '../../ui/badge';
import AddToCardButton from './AddToCardButton';
import BookMainInformation from './BookMainInformation';
import BookExtendedInformation from './BookExtendedInformation';

interface Props {
    book: BookPreview;
}

function BookInformation({ book }: Props) {
    return (
        <div className="w-full bg-background flex flex-col gap-10 p-6">
            <BookMainInformation book={book} />

            <BookExtendedInformation book={book} />
        </div>
    )
}

export default BookInformation