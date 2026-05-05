"use client"
import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
    <div className="w-full flex justify-center">
        <div className="w-full md:w-4/5 flex flex-col md:flex-row md:justify-between gap-4">
            <div>
                <p className="text-xl font-bold">Library+</p>
                <p>Online platform for renting books</p>
                <p>All rights reserved  2026 - present</p>
            </div>

            <div>
                <p className="text-xl font-bold">Clients</p>
                <p><Link href="/conditions-and-agreements" className="underline text-primary">Conditions and agreements</Link></p>
                <p><Link href="/privacy-and-security" className="underline text-primary">Privacy and security</Link></p>
                <p><Link href="/cookies-policy" className="underline text-primary">Cookies policy</Link></p>
            </div>

            <div>
                <p className="text-xl font-bold">Contact</p>
                <div className="flex items-center gap-3">
                    <EnvelopeIcon />
                    <span>library.plus@mail.com</span>
                </div>
                <div className="flex items-center gap-3">
                    <PhoneIcon />
                    <span>+12345657898</span>
                </div>
                <div className="flex items-center gap-3">
                    <BuildingOfficeIcon />
                    <span>USA, Oregon, Washington, Sunbay street, 11B</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer