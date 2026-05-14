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