import { Separator } from '@/components/ui/separator'
import React from 'react'

function AboutPage() {
    return (
        <div className="min-h-[70vh] px-7">
            <p className="font-bold text-xl">About Library+</p>
            <p>This project was made by <a className="underline text-primary" href="https://github.com/justkinou">Andrii Bialkovskyi</a> and <a className="underline text-primary" href="https://github.com/mikita672">Mikita Dzeviatau</a> for the 'Designing dynamic websites', 'Basics of containerization' and '.NET platform' courses @ Łódź University of Technology</p>
            <Separator className="my-8" />
            <div className="grid grid-cols-2 gap-7">
                <div>
                    <p>The technologies used for making this website:</p>
                    <ul className="list-disc *:ml-7">
                        <li>Frontend: React, Next.js, Tailwind, shadcn/ui</li>
                        <li>Backend: C#, ASP.NET</li>
                        <li>Database: MongoDB, PostgreSQL</li>
                        <li>Storage: MinIO</li>
                        <li>E-mail service provider: Gmail</li>
                    </ul>

                    <p className="mt-7">The website offers the following functions: book catalog view (searching, filtering, sorting and pagination are supported), authorization (sign-up, login, reset password), cart, order placement, notifications, order history view, profile customization, admin dashboard (books and orders management).</p>
                    <p>Some features like <b>TRIGGER WARNING</b> AI were added due to requirements of the course instructors.</p>
                    <p>Otherwise, the website would not have such unnecessary features, because the goal of this website was to mimic a real-world library - a place where people can rest, read books in a calm atmosphere, and stay focused and thoughtful. AI, for instance, is ruining this premise. I hope that in the future, the course instructors at the above-mentioned institution will reconsider their project requirements. This will contribute to the creation of something meaningful instead of something so shallow.</p>

                    <p className="w-full text-right">Written by Andrii Bialkovskyi</p>
                </div>

                <table>
                    <thead>
                        <tr><th>Read books!</th></tr>
                    </thead>
                    <tbody>
                        <tr className="grid justify-center mt-2"><td><img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.getmidnight.com%2F45d07b00b0188a892509950ff919e14e%2F2022%2F10%2FBook-Report--1-.jpg&f=1&nofb=1&ipt=2c1c9a70811f6b8f65a1ff4a10f16826c8bffdbae49a9fb736fc4fff035b8300" className="w-[480px]" /></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AboutPage