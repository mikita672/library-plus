import { Author } from "./Author";
import { Category } from "./Category";
import { Publisher } from "./Publisher";

export interface Book {
  id: number;
  title: string;
  description: string;
  authorId?: number | null;
  publisherId?: number | null;
  language: string;
  publicationYear: number;
  pagesCount: number;
  categoryIds: number[];
  repurchasePrice: number;
  originalTitle?: string | null;
  originalLanguage?: string | null;
  originalPublicationYear?: number | null;
  originalPublisherId?: number | null;
  coverURI?: string | null;
}

export interface UpdateBookRequest {
  title?: string | null;
  description?: string | null;
  language?: string | null;
  publicationYear?: number;
  pagesCount?: number;
  repurchasePrice?: number;
  categoryIds?: number[] | null;
  authorId?: number | null;
  publisherId?: number | null;
  originalTitle?: string | null;
  originalLanguage?: string | null;
  originalPublicationYear?: number | null;
  originalPublisherId?: number | null;
}

export interface BookPreview {
  id: number;
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
  originalPublisher?: Publisher;
  coverURI?: string;
  isAvailable: boolean;
}

export interface BookUnit {
  id: number;
  bookId: number;
  isArchived: boolean;
}

export interface BookCard {
  id: number;
  title: string;
  authorName?: string | null;
  categoryName?: string | null;
  publisherName?: string | null;
  language: string;
  publicationYear: number;
  originalPublicationYear?: number | null;
  coverURI?: string | null;
  isAvailable: boolean;
}

export interface AddBookUnitRequest {
  bookId: number;
}

export interface CreateBookRequest {
  title: string;
  description: string;
  language: string;
  publicationYear: number;
  pagesCount: number;
  repurchasePrice: number;
  categoryIds: number[];
  authorId?: number | null;
  publisherId?: number | null;
  originalTitle?: string | null;
  originalLanguage?: string | null;
  originalPublicationYear?: number | null;
  originalPublisherId?: number | null;
}
