import Link from 'next/link'
import QuestionCard from './QuestionCard'

function FAQSection() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
        <span className="text-xl font-bold">FAQ</span>

        <div className="flex flex-col px-4 w-full gap-2">
            <QuestionCard question="What if I won’t return the rented book on time?">
                <p>In case you cannot return the book on time, you can prolong the renting period (only withing the specified number of work days before the deadline). The price for the prolongation may be higher than normal price. This is due to the fact that some people may not get their book on time or there will be reschedules for the specific book’s reservations.</p>
                <p>If you miss the deadline of returning the book, then you will be charged extra fees for every day after the due date.</p>
                <b>You can read more details about the renting <Link href="/renting-details" className="cursor-pointer underline text-primary">here</Link></b>
            </QuestionCard>

            <QuestionCard question="What payment methods are available?">
                <p>As of now, you can pay for your shipping or penalty fines using cash in the library or use one of the following digital payment method: BLIK, MasterCard, Visa, PayPal</p>
            </QuestionCard>

            <QuestionCard question="How will I receive the book?">
                <p>You have 2 options:</p>
                <ul className="list-disc pl-12">
                    <li>Shipping: we will deliver you the books you ordered via a delivery service. You will have to cover the fees. Library+ is not responsible for the shipping duration.</li>
                    <li>Pick up: you can come to the library to get your books. You will need to show the librarian your order number</li>
                </ul>
            </QuestionCard>
        </div>
    </div>
  )
}

export default FAQSection