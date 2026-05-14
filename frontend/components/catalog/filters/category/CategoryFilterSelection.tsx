"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Category } from '@/types/book/Category'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Props {
    categories: Category[],
}

function CategoryFilterSelection({ categories }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [categoryIds, setCategoryIds] = useState(searchParams.getAll("categoryIds") ?? []);
    const [isExtended, setIsExtended] = useState(false);

    const displayedCategories = isExtended ? categories : categories.slice(0, 4);

    const handleSelect = (id: string) => {
        setCategoryIds(prev => [...prev, id]);
        const params = new URLSearchParams(searchParams);
        params.append("categoryIds", id);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const handleUnselect = (id: string) => {
        setCategoryIds(prev => prev.filter(_id => _id !== id));
        const params = new URLSearchParams(searchParams);
        params.delete("categoryIds", id);
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-2">
            {displayedCategories.map((c, i) => (
                <FieldGroup key={c.id} className="max-w-sm">
                    <Field orientation="horizontal">
                        <Checkbox
                            id={`category-checkbox-${c.id}`}
                            checked={categoryIds.includes(c.id)}
                            onCheckedChange={(isChecked) => {
                                if (isChecked) {
                                    handleSelect(c.id);
                                } else {
                                    handleUnselect(c.id);
                                }
                            }}
                        />
                        <Label htmlFor={`category-checkbox-${c.id}`}>{c.name}</Label>
                    </Field>
                </FieldGroup>
            ))}

            {
                categories.length > 4 ?
                    <p
                        className="underline text-primary cursor-pointer"
                        onClick={() => setIsExtended(prev => !prev)}
                    >{isExtended ? "Collapse" : "Show all"}</p> : <></>
            }
        </div>
    )
}

export default CategoryFilterSelection