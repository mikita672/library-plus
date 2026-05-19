import { Author } from "./Author";
import { Category } from "./Category";
import { Publisher } from "./Publisher";

export interface BookPreview {
    id: string;
    title: string;
    description: string;
    author?: Author;
    publisher?: Publisher;
    language: string;
    publicationYear: number;
    pagesCount: number;
    categories: Category[];
    originalTitle?: string;
    originalLanguage?: string;
    originalPublicationYear?: number;
    originalPublisherId?: string;
    coverURI?: string;
    isAvailable: boolean;
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