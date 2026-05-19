"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

function SortSelection() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = (value: string) => {
        const [attribute, direction] = value.split('-');
        const params = new URLSearchParams(searchParams);
        params.set("sortBy", attribute);
        params.set("sortDescending", direction === "desc" ? "true" : "false");
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <Select onValueChange={handleChange} defaultValue="title-asc">
            <SelectTrigger className="w-full max-w-48 bg-background">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background">
                <SelectGroup>
                    <SelectLabel>Sort by</SelectLabel>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    <SelectItem value="relevancy-asc">Relevancy (most popular first)</SelectItem>
                    <SelectItem value="relevancy-desc">Relevancy (most popular last)</SelectItem>
                    <SelectItem value="publicationyear-asc">Publication Year (older first)</SelectItem>
                    <SelectItem value="publicationyear-desc">Publication Year (older last)</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default SortSelection