"use client";

import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cartContext } from '@/context/cartContext';
import { BasketIcon } from '@phosphor-icons/react';
import { useContext, useState } from 'react'
import CartList from './CartList';
import CartFooter from './CartFooter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Cart() {
    const { bookIds } = useContext(cartContext);
    const [page, setPage] = useState(1);

    if (bookIds === null) {
        return <BasketIcon className="w-6 h-6 text-foreground transition-colors hover:text-gray-400" />;
    }

    const pagesCount = Math.ceil(bookIds.length / 3);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer" title="Cart">
                    <BasketIcon className="w-6 h-6 text-foreground transition-colors hover:text-gray-400" />
                    {
                        bookIds.length === 0 ?
                            <></> :
                            <div className="select-none text-light absolute -bottom-1 -right-2 bg-destructive rounded-full w-4 h-4 text-xs text-center">
                                {Math.min(bookIds.length, 99)}
                            </div>
                    }
                </div>
            </PopoverTrigger>
            <PopoverContent align="center" sideOffset={10} className="w-90">
                <PopoverHeader>
                    <div className="w-full flex justify-between items-center">
                        <PopoverTitle>Cart</PopoverTitle>

                        {bookIds.length > 0 ?
                            <Link href="/checkout">
                                <Button className="cursor-pointer">Go to checkout</Button>
                            </Link>
                            : <></>
                        }
                    </div>
                </PopoverHeader>
                {bookIds.length === 0 ?
                    <div className="p-4 w-full flex justify-center align-center">
                        No items
                    </div> :
                    <>
                        <CartList ids={bookIds.slice((page - 1) * 3, page * 3)} />
                        <Separator />
                        <CartFooter page={page} pagesCount={pagesCount} setPage={setPage} />
                    </>
                }
            </PopoverContent>
        </Popover >

    )
}

export default Cart