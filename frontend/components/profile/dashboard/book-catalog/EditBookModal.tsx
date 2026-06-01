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
import { Separator } from "@/components/ui/separator";
import { PackageIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { addBookUnit, updateBook } from "@/lib/api/books";
import { BookCard, UpdateBookRequest } from "@/types/book/Book";

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
  const [addingUnit, setAddingUnit] = useState(false);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [publicationYear, setPublicationYear] = useState<number | "">("");

  const [unitsAddedThisSession, setUnitsAddedThisSession] = useState(0);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setLanguage(book.language);
      setPublicationYear(book.publicationYear);
      setUnitsAddedThisSession(0);
    }
  }, [book]);

  const handleSave = async () => {
    if (!book) return;
    setSaving(true);

    const body: UpdateBookRequest = {
      title: title.trim() || null,
      language: language.trim() || null,
      publicationYear:
        typeof publicationYear === "number" ? publicationYear : undefined,
    };

    try {
      await updateBook(book.id, body);
      toast.success(`"${book.title}" updated successfully`);
      await onSave?.(book);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnit = async () => {
    if (!book) return;
    setAddingUnit(true);
    try {
      await addBookUnit(book.id);
      setUnitsAddedThisSession((n) => n + 1);
      toast.success("Physical copy added to inventory");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add physical copy",
      );
    } finally {
      setAddingUnit(false);
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
            <Label htmlFor="edit-author" className="text-right">
              Author
            </Label>
            <Input
              id="edit-author"
              value={book?.authorName ?? "-"}
              disabled
              className="col-span-3"
            />
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddUnit}
              disabled={addingUnit || !book}
              className="gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              {addingUnit ? "Adding..." : "Add copy"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Each copy is a separate physical unit tracked in the inventory.
            Copies are removed automatically when a reservation is returned.
          </p>
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
