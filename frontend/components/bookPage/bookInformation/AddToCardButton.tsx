"use client"

import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { InfoIcon } from '@phosphor-icons/react';
import Link from 'next/link';

interface Props {
    isAvailable: boolean;
}

function AddToCardButton({ isAvailable }: Props) {
    return (
        <div className="w-full flex flex-col gap-2">
            {isAvailable ? <></> : <p className="text-destructive">Not available</p>}

            {isAvailable ?
                <Button
                    className="w-fit px-12 py-6 font-bold text-2xl bg-primary cursor-pointer"
                >Add to your cart!</Button> :
                <Button
                    className="w-fit px-12 py-6 font-bold text-2xl bg-accent cursor-not-allowed text-foreground opacity-50"
                >Add to your cart!</Button>
            }

            <Link href="/return-policies">
                <Badge variant="secondary" className="rounded-full">
                    <InfoIcon /> Learn more about our return policies
                </Badge>
            </Link>
        </div>
    )
}

export default AddToCardButton