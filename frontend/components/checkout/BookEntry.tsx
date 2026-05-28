"use client"

import { cartContext } from "@/context/cartContext";
import { BookCard } from "@/types/book/Book"
import { CalendarIcon, TrashIcon } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldLabel } from "../ui/field";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

interface Props {
    book: BookCard,
}

function BookEntry({ book }: Props) {
    const { removeBook } = useContext(cartContext);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 21),
    })

    return (
        <div className="w-full grid grid-cols-5 items-center gap-24 bg-background p-4">
            <div className="col-span-3 flex items-center gap-4">
                <img
                    src={book.coverURI ?? "/images/book-placeholder.png"}
                    className="w-full max-w-[100px] h-[100px] object-contain"
                    alt="Book cover"
                />

                <div className="w-full space-y-2">
                    <p className="text-xl font-bold">{book.title}</p>
                    <div className="w-full grid grid-cols-2 gap-2">
                        <p className="opacity-50">Language: {book.language}</p>
                        <p className="opacity-50">Author: {book.authorName ?? "Unknown"}</p>
                        <p className="opacity-50">Publication year: {book.originalPublicationYear ?? book.publicationYear}</p>
                        {book.isAvailable ?
                            <p className="font-bold">Available now</p> : <p className="text-destructive font-bold">Not Available</p>}
                    </div>
                </div>
            </div>

            <div className="col-span-2 flex items-center justify-between px-4">
                <Field className="w-50 relative">
                    <FieldLabel htmlFor="date-picker-range" className="absolute -top-5">Reservation time</FieldLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker-range"
                                className="justify-start cursor-pointer"
                            >
                                <CalendarIcon />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>

                <TrashIcon
                    className="text-destructive w-6 h-6 cursor-pointer"
                    onClick={() => {
                        removeBook(book.id);
                    }}
                />
            </div>
        </div>
    )
}

export default BookEntry