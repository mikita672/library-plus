"use client"

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Author } from '@/types/book/Author'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Props {
    authors: Author[],
}

function AuthorFilterRadioGroup({ authors }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [authorId, setAuthorId] = useState(searchParams.get("authorId") ?? "");
    const [isExtended, setIsExtended] = useState(false);

    const displayedAuthors = isExtended ? authors : authors.slice(0, 4);

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
        <div className="flex flex-col gap-2">
            <RadioGroup value={authorId} onValueChange={handleChange}>
                <Field orientation="horizontal">
                    <RadioGroupItem value="" id="author-none" />
                    <FieldContent>
                        <FieldLabel htmlFor="author-none">Any author</FieldLabel>
                    </FieldContent>
                </Field>

                {displayedAuthors.map((a) => (
                    <Field key={a.id} orientation="horizontal">
                        <RadioGroupItem value={a.id} id={`author-${a.id}`} />
                        <FieldContent>
                            <FieldLabel htmlFor={`author-${a.id}`}>{a.name}</FieldLabel>
                        </FieldContent>
                    </Field>
                ))}
            </RadioGroup>

            {
                authors.length > 4 ?
                    <p
                        className="underline text-primary cursor-pointer"
                        onClick={() => setIsExtended(prev => !prev)}
                    >{isExtended ? "Collapse" : "Show all"}</p> : <></>
            }
        </div>
    )
}

export default AuthorFilterRadioGroup