"use client"

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { userContext } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { toast } from 'sonner';

function Contact() {
    const [message, setMessage] = useState('');
    const { userData, isLoading } = useContext(userContext);
    const router = useRouter();

    if (isLoading) {
        return <p>Loading...</p>
    }
    if (userData === null) {
        router.replace('/login');
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const response = await fetch('/api/misc/contact', {
            method: "POST",
            body: JSON.stringify({
                message,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            toast.error("Failed to send your message");
        } else {
            toast.success("Message sent");
            setMessage('');
        }
    }

    return (
        <div className="size-full flex justify-center items-center">
            <form onSubmit={onSubmit} className="flex flex-col gap-4 w-xl p-4 bg-card">
                <Field>
                    <FieldLabel htmlFor="contact">Contact</FieldLabel>
                    <Textarea onChange={(e) => setMessage(e.target.value)} className="bg-background" id="contact" placeholder="Enter your message" rows={8} />
                </Field>

                <Button type="submit" className="cursor-pointer">Send</Button>
            </form>
        </div>
    )
}

export default Contact