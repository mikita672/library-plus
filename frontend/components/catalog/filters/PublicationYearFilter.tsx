"use client"

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react'

const currentYear = new Date().getFullYear();

function PublicationYearFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const minYear = searchParams.get("minPublicationYear") ?? "0"
    const maxYear = searchParams.get("maxPublicationYear") ?? currentYear.toString();

    const [minPublicationYear, setMinPublicationYear] = useState(minYear);
    const [maxPublicationYear, setMaxPublicationYear] = useState(maxYear);

    const onApply = () => {
        const params = new URLSearchParams(searchParams);
        params.set("minPublicationYear", minPublicationYear);
        params.set("maxPublicationYear", maxPublicationYear);
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-1">
            <p>Publication year</p>

            <div className="w-full flex justify-between gap-2">
                <Field>
                    <FieldLabel htmlFor="min-publication-year">Min year</FieldLabel>
                    <Input
                        id="min-publication-year"
                        type="number"
                        min={0}
                        max={parseInt(maxPublicationYear)}
                        value={minPublicationYear}
                        onChange={(e) => setMinPublicationYear(e.target.value)}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="max-publication-year">Max year</FieldLabel>
                    <Input
                        id="max-publication-year"
                        type="number"
                        min={parseInt(minPublicationYear)}
                        max={currentYear}
                        value={maxPublicationYear}
                        onChange={(e) => setMaxPublicationYear(e.target.value)}
                    />
                </Field>
            </div>

            <Button
                className="w-full cursor-pointer"
                onClick={onApply}
            >Apply</Button>
        </div>
    )
}

export default PublicationYearFilter