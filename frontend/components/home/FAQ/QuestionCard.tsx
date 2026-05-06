"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CaretDownIcon } from '@phosphor-icons/react'
import React from 'react'

interface Props {
    question: string;
    children: React.ReactNode;
}

function QuestionCard({ question, children: answer }: Props) {
  return (
    <Card className="w-full bg-background">
        <CardContent className="w-full">
            <Collapsible className="rounded-md data-[state=open]:bg-muted">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="group w-full md:flex justify-between cursor-pointer">
                        <div className="text-lg font-bold">{question}</div>
                        <CaretDownIcon className="hidden md:block group-data-[state=open]:rotate-180" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col items-start gap-2 p-4 text-sm">
                    {answer}
                </CollapsibleContent>
            </Collapsible>
        </CardContent>
    </Card>
  )
}

export default QuestionCard