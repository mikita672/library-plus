"use client"
import { EnvelopeIcon, InfoIcon, StorefrontIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import React from 'react'

function HeaderLinks() {
    return (
        <div className="flex items-center justify-center gap-4 pr-12">
            <Link href="/catalog" className="flex items-center justify-center gap-1 hover:text-primary text-base hover:border-b hover:border-primary">
                <StorefrontIcon />
                <span>Catalog</span>
            </Link>
            <Link href="/contact" className="flex items-center justify-center gap-1 hover:text-primary text-base hover:border-b hover:border-primary">
                <EnvelopeIcon />
                <span>Contact</span>
            </Link>
            <Link href="/about" className="flex items-center justify-center gap-1 hover:text-primary text-base hover:border-b hover:border-primary">
                <InfoIcon />
                <span>About us</span>
            </Link>
        </div>
    )
}

export default HeaderLinks