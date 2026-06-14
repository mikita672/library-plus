"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useDebounce } from '@/hooks/useDebounce';

function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [inputValue, setInputValue] = useState(searchParams.get("searchToken") ?? "");
    const debouncedSearch = useDebounce(inputValue, 500);
    const initialRender = useRef(true);

    useEffect(() => {
        const currentSearch = searchParams.get("searchToken") ?? "";
        setInputValue(prev => prev !== currentSearch ? currentSearch : prev);
    }, [searchParams]);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const params = new URLSearchParams(searchParams);
        const currentSearch = searchParams.get("searchToken") ?? "";

        if (debouncedSearch !== currentSearch) {
            params.delete("pageNumber");
            if (debouncedSearch.length === 0) {
                params.delete("searchToken");
            } else {
                params.set("searchToken", debouncedSearch);
            }
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [debouncedSearch, pathname, router, searchParams]);

    return (
        <div className="flex w-full gap-2">
            <Input
                className="h-10 text-base bg-background"
                placeholder="Search books..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none bg-background">
                <MagnifyingGlassIcon className="h-5 w-5" />
            </Button>
        </div>
    )
}

export default SearchBar