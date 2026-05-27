"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCard } from "@/types/book/Book";

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BookCard>>(book || {});

  const handleChange = (key: keyof BookCard, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!book?.id) return;
    setLoading(true);

    await onSave?.(formData as BookCard);
    onOpenChange(false);
    setFormData({});
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update book details below. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <Input
              id="id"
              value={book?.id || ""}
              disabled
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="col-span-3"
              placeholder="Enter book title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author" className="text-right">
              Author
            </Label>
            <Input
              id="author"
              value={formData.authorName || ""}
              onChange={(e) => handleChange("authorName", e.target.value)}
              className="col-span-3"
              placeholder="Enter author name"
              disabled
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              Language
            </Label>
            <Input
              id="language"
              value={formData.language || ""}
              onChange={(e) => handleChange("language", e.target.value)}
              className="col-span-3"
              placeholder="e.g., English"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <Input
              id="year"
              type="number"
              value={formData.publicationYear || ""}
              onChange={(e) =>
                handleChange("publicationYear", parseInt(e.target.value))
              }
              className="col-span-3"
              placeholder="e.g., 2024"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="availability" className="text-right">
              Availability
            </Label>
            <Select
              value={formData.isAvailable ? "available" : "unavailable"}
              onValueChange={(value) =>
                handleChange("isAvailable", value === "available")
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
