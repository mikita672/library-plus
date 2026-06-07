"use client"

import Link from 'next/link'
import QuestionCard from './QuestionCard'
import { useContext, useState } from "react"
import { userContext } from "@/context/userContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function FAQSection() {
  const { userData, isLoading } = useContext(userContext)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loadingAnswer, setLoadingAnswer] = useState(false)

  const askAi = async () => {
    if (!question.trim()) return
    setLoadingAnswer(true)
    setAnswer("")
    try {
      const res = await fetch("/api/misc/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })
      if (res.ok) {
        const data = await res.json()
        setAnswer(data.answer)
      } else {
        setAnswer("Failed to get answer. Please try again.")
      }
    } catch (e) {
      setAnswer("An error occurred. Please try again.")
    } finally {
      setLoadingAnswer(false)
    }
  }

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

        <div className="mt-6 flex flex-col gap-4 border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
          <span className="text-lg font-semibold">Do you have more questions?</span>

          {isLoading ? null : !userData ? (
            <div className="text-center py-2">
              <span className="text-muted-foreground">Login to get access to this feature </span>
              <Link href="/auth/login" className="underline text-primary">Login here</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  onKeyDown={e => e.key === 'Enter' && askAi()}
                  className="bg-background"
                />
                <Button onClick={askAi} disabled={loadingAnswer || !question.trim()} className="cursor-pointer">
                  {loadingAnswer ? "Thinking..." : "Ask"}
                </Button>
              </div>
              {answer && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{answer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FAQSection