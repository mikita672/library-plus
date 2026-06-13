"use client"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function AvailabilityFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = (availability: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("pageNumber");
        if (availability.length === 0) {
            params.delete("isAvailable");
        } else {
            params.set("isAvailable", availability);
        }
        router.replace(`${pathname}?${params.toString()}`);
    }

    const isAvailable = searchParams.get("isAvailable") ?? "";

    return (
        <div className="flex flex-col gap-2">
            <p>Availability</p>

            <RadioGroup defaultValue={isAvailable} onValueChange={handleChange}>
                <Field orientation="horizontal">
                    <RadioGroupItem value="" id="availability-none" />
                    <FieldContent>
                        <FieldLabel htmlFor="availability-none">Any availability</FieldLabel>
                    </FieldContent>
                </Field>

                <Field orientation="horizontal">
                    <RadioGroupItem value="true" id="availability-true" />
                    <FieldContent>
                        <FieldLabel htmlFor="availability-true">Available</FieldLabel>
                    </FieldContent>
                </Field>

                <Field orientation="horizontal">
                    <RadioGroupItem value="false" id="availability-false" />
                    <FieldContent>
                        <FieldLabel htmlFor="availability-false">Not available</FieldLabel>
                    </FieldContent>
                </Field>
            </RadioGroup>
        </div>
    )
}

export default AvailabilityFilter