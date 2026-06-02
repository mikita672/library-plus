"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PackageIcon, PlusIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getAuthors } from "@/lib/api/authors";
import { addBookUnits, getBookById, updateBook } from "@/lib/api/books";
import { uploadBookCover } from "@/lib/api/media";
import { getCategories } from "@/lib/api/categories";
import { getPublishers } from "@/lib/api/publishers";
import { Author } from "@/types/book/Author";
import { BookCard, UpdateBookRequest } from "@/types/book/Book";
import { Category } from "@/types/book/Category";
import { Publisher } from "@/types/book/Publisher";

interface EditBookModalProps {
  book: BookCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedBook: BookCard) => Promise<void>;
}

export default function EditBookModal({
  book,
  open,
  onOpenChange,
  onSave,
}: EditBookModalProps) {
  const [saving, setSaving] = useState(false);
  const [addingUnits, setAddingUnits] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [publicationYear, setPublicationYear] = useState<number | "">("");
  const [authorId, setAuthorId] = useState<string>("none");
  const [publisherId, setPublisherId] = useState<string>("none");
  const [categoryId, setCategoryId] = useState<string>("none");

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [copiesToAdd, setCopiesToAdd] = useState(1);
  const [unitsAddedThisSession, setUnitsAddedThisSession] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [authorsData, publishersData, categoriesData] = await Promise.all(
          [getAuthors(), getPublishers(), getCategories()],
        );
        setAuthors(authorsData);
        setPublishers(publishersData);
        setCategories(categoriesData);
      } catch {
        toast.error("Failed to load metadata lookups");
      } finally {
        setLoadingLookups(false);
      }
    };

    void loadLookups();
  }, [open]);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setLanguage(book.language);
      setPublicationYear(book.publicationYear);
      setCopiesToAdd(1);
      setUnitsAddedThisSession(0);
      setAuthorId("none");
      setPublisherId("none");
      setCategoryId("none");

      const loadDetails = async () => {
        setLoadingDetails(true);
        try {
          const details = await getBookById(book.id);
          if (details.categories && details.categories.length > 0) {
            setCategoryId(details.categories[0].id);
          }
        } catch {
        } finally {
          setLoadingDetails(false);
        }
      };
      void loadDetails();
    }
  }, [book]);

  useEffect(() => {
    if (book && authors.length > 0 && book.authorName) {
      const match = authors.find((a) => a.name === book.authorName);
      if (match) setAuthorId(match.id);
    }
  }, [book, authors]);

  const handleSave = async () => {
    if (!book) return;
    setSaving(true);

    const body: UpdateBookRequest = {
      title: title.trim() || null,
      language: language.trim() || null,
      publicationYear:
        typeof publicationYear === "number" ? publicationYear : undefined,
      authorId: authorId === "none" ? null : authorId,
      publisherId: publisherId === "none" ? null : publisherId,
      categoryIds: categoryId === "none" ? [] : [categoryId],
    };

    try {
      await updateBook(book.id, body);

      if (selectedFile) {
        try {
          await uploadBookCover(book.id, selectedFile);
        } catch (uploadErr) {
          toast.error("Book updated, but cover upload failed.");
        }
      }

      toast.success(`"${book.title}" updated successfully`);
      await onSave?.(book);
      onOpenChange(false);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnits = async () => {
    if (!book || copiesToAdd < 1) return;
    setAddingUnits(true);
    try {
      await addBookUnits(book.id, copiesToAdd);
      setUnitsAddedThisSession((n) => n + copiesToAdd);
      toast.success(
        `${copiesToAdd} physical ${copiesToAdd === 1 ? "copy" : "copies"} added`,
      );
      setCopiesToAdd(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add copies");
    } finally {
      setAddingUnits(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update book details and manage physical copies below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter book title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Author</Label>
            <Select
              value={authorId}
              onValueChange={setAuthorId}
              disabled={loadingLookups}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No author</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Publisher</Label>
            <Select
              value={publisherId}
              onValueChange={setPublisherId}
              disabled={loadingLookups}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select publisher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No publisher</SelectItem>
                {publishers.map((publisher) => (
                  <SelectItem key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={loadingLookups || loadingDetails}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue
                  placeholder={
                    loadingDetails ? "Loading..." : "Select category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-language" className="text-right">
              Language
            </Label>
            <Input
              id="edit-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="col-span-3"
              placeholder="e.g., English"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-year" className="text-right">
              Year
            </Label>
            <Input
              id="edit-year"
              type="number"
              value={publicationYear}
              onChange={(e) =>
                setPublicationYear(
                  e.target.value ? parseInt(e.target.value) : "",
                )
              }
              className="col-span-3"
              placeholder="e.g., 2024"
            />
          </div>

          <ImageUpload
            id="edit-cover"
            label="Cover"
            onFileSelect={setSelectedFile}
            initialPreviewUrl={book?.coverURI}
            aspectRatio="cover"
            className="grid grid-cols-4 items-start gap-4"
            labelClassName="text-right pt-2"
            contentClassName="col-span-3"
          />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Availability</Label>
            <div className="col-span-3">
              {book ? (
                <span
                  className={`font-medium ${book.isAvailable ? "text-green-600" : "text-destructive"}`}
                >
                  {book.isAvailable ? "Available" : "Unavailable"}
                </span>
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Physical Copies</span>
              {unitsAddedThisSession > 0 && (
                <span className="bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  +{unitsAddedThisSession} added this session
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={copiesToAdd}
                onChange={(e) =>
                  setCopiesToAdd(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddUnits}
                disabled={addingUnits || !book}
                className="gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                {addingUnits ? "Adding..." : "Add copies"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
