import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

function GreetingSection() {
  return (
    <div className="w-full px-12 py-24 relative overflow-hidden bg-[url(/images/greetingSectionBackground.jpg)] bg-center bg-no-repeat bg-cover bg-fixed">
        <div className="relative z-10 w-full sm:w-1/2 text-center sm:text-left">
            <div className="text-light mb-6">
                <p className="font-bold text-2xl mb-2">Welcome to Library+</p>

                <p>Here you can browse our vast collection of books and rent the ones that are the best for you. Our catalog contains 10,000 written pieces, so everyone can find something for himself</p>
            </div>

            <Button className="bg-primary text-light cursor-pointer hover:opacity-80 text-lg px-8 py-6">
                <Link href="/catalog">Browse catalog</Link>
            </Button>
        </div>
    </div>
  )
}

export default GreetingSection