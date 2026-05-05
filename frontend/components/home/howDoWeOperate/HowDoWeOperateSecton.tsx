"use client"

import { ArrowsClockwiseIcon, BookBookmarkIcon, CalendarDotsIcon, PackageIcon } from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import InformationCard from './InformationCard';

function HowDoWeOperateSecton() {
  const theme = useTheme();

  return (
    <div className="w-full p-4 lg:p-12 flex flex-col justify-center items-center gap-4 overflow-hidden bg-[url(/images/howDoWeOperateSectionBackground.jpg)] bg-center bg-no-repeat bg-cover bg-fixed">
      <span className="text-xl text-light font-bold">How dow we operate?</span>

      <div className="flex flex-col md:flex-row w-full justify-between items-center gap-6 md:gap-0">
        <InformationCard
          sequentialNumber={1}
          title="Decide which books to rent"
          text="Browse our extensive collection of literature and find what fits your interests"
          icon={<BookBookmarkIcon size={48} />}
        />

        <InformationCard
          sequentialNumber={2}
          title="Choose the renting period"
          text="You can rent a book for a few days or a few month"
          icon={<CalendarDotsIcon size={48} />}
        />

        <InformationCard
          sequentialNumber={3}
          title="Receive the books"
          text="The books will arrive via any delivery you want. You can also get the books from your local Library+"
          icon={<PackageIcon size={48} />}
        />

        <InformationCard
          sequentialNumber={4}
          title="Return the books"
          text="You will have to return the books before the due date. You will be notified a few days prior to the deadline"
          icon={<ArrowsClockwiseIcon size={48} />}
        />
      </div>
    </div>
  )
}

export default HowDoWeOperateSecton