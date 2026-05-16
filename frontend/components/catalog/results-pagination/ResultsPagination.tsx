import React from 'react'
import PageSelection from './PageSelection';

interface Props {
    params: URLSearchParams;
}

async function ResultsPagination({ params }: Props) {
    const response = await fetch(`${process.env.API_URL}/books/pages?${params.toString()}`, {
        method: "GET",
    });

    if (!response.ok) {
        return <div className="text-destructive">Failed to fetch books</div>
    }

    const pagesCount: number = await response.json();

    return <PageSelection pageNumber={parseInt(params.get("pageNumber") ?? "1")} pagesCount={pagesCount} />
}

export default ResultsPagination