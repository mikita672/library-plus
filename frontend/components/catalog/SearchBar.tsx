"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Button } from '../ui/button';

function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchToken, setSearchToken] = useState(searchParams.get("searchToken") ?? "");

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("pageNumber");

        if (searchToken.length === 0) {
            params.delete("searchToken");
        } else {
            params.set("searchToken", searchToken);
        }

        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <InputGroup className="py-5 bg-background">
            <InputGroupInput
                placeholder="Search books by name"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
            />

            <InputGroupAddon>
                <MagnifyingGlassIcon />
            </InputGroupAddon>

            <InputGroupAddon align="inline-end">
                <Button
                    className="cursor-pointer px-6"
                    onClick={handleSearch}
                >Search</Button>
            </InputGroupAddon>
        </InputGroup>
    )
}

export default SearchBar