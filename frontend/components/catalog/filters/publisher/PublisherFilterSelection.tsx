"use client"

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Publisher } from '@/types/book/Publisher'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Props {
    publishers: Publisher[],
}

function PublisherFilterSelection({ publishers }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [publisherId, setPublisherId] = useState(searchParams.get("publisherId") ?? "");
    const [isExtended, setIsExtended] = useState(false);

    const displayedPublishers = isExtended ? publishers : publishers.slice(0, 4);

    const handleChange = (id: string) => {
        setPublisherId(id.toString());

        const params = new URLSearchParams(searchParams);
        params.delete("pageNumber");
        if (id.toString().length === 0) {
            params.delete("publisherId");
        } else {
            params.set("publisherId", id.toString());
        }
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-2">
            <RadioGroup value={publisherId?.toString()} onValueChange={handleChange}>
                <Field orientation="horizontal">
                    <RadioGroupItem value="" id="publisher-none" />
                    <FieldContent>
                        <FieldLabel htmlFor="publisher-none">Any publisher</FieldLabel>
                    </FieldContent>
                </Field>

                {displayedPublishers.map((a) => (
                    <Field key={a.id} orientation="horizontal">
                        <RadioGroupItem value={a.id.toString()} id={`publisher-${a.id}`} />
                        <FieldContent>
                            <FieldLabel htmlFor={`publisher-${a.id}`}>{a.name}</FieldLabel>
                        </FieldContent>
                    </Field>
                ))}
            </RadioGroup>

            {
                publishers.length > 4 ?
                    <p
                        className="underline text-primary cursor-pointer"
                        onClick={() => setIsExtended(prev => !prev)}
                    >{isExtended ? "Collapse" : "Show all"}</p> : <></>
            }
        </div>
    )
}

export default PublisherFilterSelection