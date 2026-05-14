"use client"

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Author } from '@/types/book/Author'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Props {
    authors: Author[],
}

function AuthorFilter({ authors }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [authorId, setAuthorId] = useState(searchParams.get("authorId") ?? "");
    const handleChange = (id: string) => {
        setAuthorId(id);

        const params = new URLSearchParams(searchParams);
        if (authorId.length === 0) {
            params.delete("authorId");
        } else {
            params.set("authorId", authorId);
        }
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-1">
            <p>Author</p>
            <RadioGroup value={authorId} onValueChange={handleChange}>
                <Field orientation="horizontal">
                    <RadioGroupItem value="" id="author-none" />
                    <FieldContent>
                        <FieldLabel htmlFor="author-none">Any author</FieldLabel>
                    </FieldContent>
                </Field>

                {authors.map((a) => (
                    <Field key={a.id} orientation="horizontal">
                        <RadioGroupItem value={a.id} id={`author-${a.id}`} />
                        <FieldContent>
                            <FieldLabel htmlFor={`author-${a.id}`}>{a.name}</FieldLabel>
                        </FieldContent>
                    </Field>
                ))}
            </RadioGroup>
        </div>
    )
}

export default AuthorFilter