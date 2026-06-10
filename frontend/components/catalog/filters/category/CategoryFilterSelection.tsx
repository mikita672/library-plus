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

    const categoryIds = searchParams.getAll("categoryIds") ?? [];
    const [isExtended, setIsExtended] = useState(false);

    const displayedCategories = isExtended ? categories : categories.slice(0, 4);

    const handleSelect = (id: number) => {
        const params = new URLSearchParams(searchParams);
        params.delete("pageNumber");
        params.append("categoryIds", id.toString());
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    const handleUnselect = (id: number) => {
        const newCategoryIds = categoryIds.filter(_id => _id !== id.toString());
        const params = new URLSearchParams(searchParams.toString());
        params.delete("pageNumber");
        params.delete("categoryIds");
        for (const categoryId of newCategoryIds) {
            params.append("categoryIds", categoryId);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        router.refresh();
    }

    return (
        <div className="flex flex-col gap-2">
            {displayedCategories.map((c) => (
                <FieldGroup key={c.id} className="max-w-sm">
                    <Field orientation="horizontal">
                        <Checkbox
                            id={`category-checkbox-${c.id}`}
                            checked={categoryIds.includes(c.id.toString())}
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