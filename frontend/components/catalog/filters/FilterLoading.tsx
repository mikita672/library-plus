"use client";

import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

interface Props {
    name: string,
}

function FilterLoading({ name }: Props) {
    return (
        <Item variant="muted">
            <ItemMedia>
                <Spinner />
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="line-clamp-1">Loading {name}</ItemTitle>
            </ItemContent>
        </Item>
    )
}

export default FilterLoading