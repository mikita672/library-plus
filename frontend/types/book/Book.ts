export interface Book {
    id: string;
    title: string;
    description: string;
    authorId?: string | null;
    publisherId?: string | null;
    language: string;
    publicationYear: number;
    pagesCount: number;
    categoryIds: string[];
    repurchasePrice: number;
    originalTitle?: string | null;
    originalLanguage?: string | null;
    originalPublicationYear?: number | null;
    originalPublisherId?: string | null;
    coverURI?: string | null;
}

export interface BookCard {
    id: string;
    title: string;
    authorName?: string | null;
    language: string;
    publicationYear: number;
    originalPublicationYear?: number | null;
    coverURI?: string | null;
    isAvailable: boolean;
}