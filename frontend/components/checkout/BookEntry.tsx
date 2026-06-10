"use client"

import { cartContext } from "@/context/cartContext";
import { BookCard } from "@/types/book/Book"
import { CalendarIcon, TrashIcon } from "@phosphor-icons/react";
import { useContext } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldLabel } from "../ui/field";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface Props {
    book: BookCard,
    dateRange: DateRange | undefined,
    changeDateRange: (newRange: DateRange | undefined) => void,
}

function BookEntry({ book, dateRange, changeDateRange }: Props) {
    const { removeBook } = useContext(cartContext);

    return (
        <div className="w-full grid grid-cols-5 items-center gap-12 bg-background p-4">
            <div className="col-span-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <div className="flex gap-4">
                    <Field className="relative">
                        <FieldLabel className="absolute -top-5">Start Date</FieldLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start cursor-pointer w-full"
                                >
                                    <CalendarIcon className="mr-2" />
                                    {dateRange?.from ? format(dateRange.from, "LLL dd, y") : "Pick start"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange?.from}
                                    onSelect={(date) => changeDateRange({ from: date, to: dateRange?.to })}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </Field>

                    <Field className="relative">
                        <FieldLabel className="absolute -top-5">End Date</FieldLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start cursor-pointer w-full"
                                >
                                    <CalendarIcon className="mr-2" />
                                    {dateRange?.to ? format(dateRange.to, "LLL dd, y") : "Pick end"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    defaultMonth={dateRange?.to ?? dateRange?.from}
                                    selected={dateRange?.to}
                                    onSelect={(date) => changeDateRange({ from: dateRange?.from, to: date })}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </Field>
                </div>

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