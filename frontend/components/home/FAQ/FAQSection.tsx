"use client"

import QuestionCard from './QuestionCard'

function FAQSection() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <span className="text-xl font-bold">FAQ</span>

      <div className="flex flex-col px-4 w-full gap-2">
        <QuestionCard question="What if I won’t return the rented book on time?">
          <p>If you return the book past the due date, you will receive a penalty of 1$ for each day until it reaches 30 days. After 30 days, you will be additionally charged for the book repurchase price (which varies).</p>
          <p>After paying for the missed days and the repurchase price, you are not required to give the book back. But if you did not pay for the repurchase (only for missed days), you must pay for those days and return the book.</p>
        </QuestionCard>

        <QuestionCard question="What payment methods are available?">
          <p>Payment methods for penalties are conditioned by the library equipment and may vary, but are usually card or cash.</p>
        </QuestionCard>

        <QuestionCard question="How will I receive the book?">
          <p>You can only get the book from the library directly. There is no shipping available.</p>
          <p>The same applies to returning books - they must be returned in person to the library.</p>
        </QuestionCard>
      </div>
    </div>
  )
}

export default FAQSection