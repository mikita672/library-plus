"use client"

import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { InfoIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useContext } from 'react';
import { cartContext } from '@/context/cartContext';

interface Props {
    id: string,
    isAvailable: boolean;
}

function AddToCardButton({ id, isAvailable }: Props) {
    const { bookIds, addBook, removeBook } = useContext(cartContext);


    return (
        <div className="w-full flex flex-col gap-2">
            {isAvailable ? <></> : <p className="text-destructive">Not available</p>}

            {
                bookIds?.includes(id) ?
                    <Button
                        className="w-fit px-12 py-6 font-bold text-2xl bg-primary cursor-pointer"
                        onClick={() => removeBook(id)}
                    >Added to cart!</Button> :
                    (
                        isAvailable ?
                            <Button
                                className="w-fit px-12 py-6 font-bold text-2xl bg-primary cursor-pointer"
                                onClick={() => {
                                    addBook(id);
                                }}
                            >Add to your cart!</Button> :
                            <Button
                                className="w-fit px-12 py-6 font-bold text-2xl bg-accent cursor-not-allowed text-foreground opacity-50"
                            >Add to your cart!</Button>
                    )
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