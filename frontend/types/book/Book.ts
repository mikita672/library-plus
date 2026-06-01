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

export interface UpdateBookRequest {
  title?: string | null;
  description?: string | null;
  language?: string | null;
  publicationYear?: number;
  pagesCount?: number;
  repurchasePrice?: number;
  categoryIds?: string[] | null;
  authorId?: string | null;
  publisherId?: string | null;
  originalTitle?: string | null;
  originalLanguage?: string | null;
  originalPublicationYear?: number | null;
  originalPublisherId?: string | null;
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

export interface AddBookUnitRequest {
  bookId: string;
}
