import Link from 'next/link'
import React from 'react'

function Logo() {
  return (
    <Link href="/" className="font-bold text-xl cursor-pointer transition-colors hover:text-gray-400">Library+</Link>
  )
}

export default Logo