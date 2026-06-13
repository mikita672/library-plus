"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

import { getAuthors } from "@/lib/api/authors";
import { addBookUnits, getBookById, updateBook } from "@/lib/api/books";
import { uploadBookCover } from "@/lib/api/media";
import { getCategories } from "@/lib/api/categories";
import { getPublishers } from "@/lib/api/publishers";
import { Author } from "@/types/book/Author";
import { BookCard, UpdateBookRequest } from "@/types/book/Book";
import { Category } from "@/types/book/Category";
import { Publisher } from "@/types/book/Publisher";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props {
  book: BookCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (book: BookCard) => Promise<void>;
}

export default function EditBookModal({ book, open, onOpenChange, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState({ authors: [] as Author[], publishers: [] as Publisher[], categories: [] as Category[] });
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);

  const [language, setLanguage] = useState("");
  const [pagesCount, setPagesCount] = useState("");
  const [repurchasePrice, setRepurchasePrice] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("");
  const [originalYear, setOriginalYear] = useState("");
  
  useEffect(() => {
    if (!open || !book) { return; }
    (async () => {
      setLoading(true);
      try {
        const [details, a, p, c] = await Promise.all([getBookById(book.id), getAuthors(), getPublishers(), getCategories()]);
        setTitle(details.title);
        setDescription(details.description || "");
        setAuthorId(details.author?.id?.toString() || "");
        setPublisherId(details.publisher?.id?.toString() || "");
        setCategoryId(details.categories?.[0]?.id?.toString() || "");
        setYear(String(details.publicationYear));
        setLanguage(details.language || "English");
        setPagesCount(String(details.pagesCount || 100));
        setRepurchasePrice(String(details.repurchasePrice || 10));
        setOriginalTitle(details.originalTitle || "");
        setOriginalLanguage(details.originalLanguage || "");
        setOriginalYear(details.originalPublicationYear ? String(details.originalPublicationYear) : "");
        setLookups({ authors: a, publishers: p, categories: c });
      } finally { setLoading(false); }
    })();
  }, [open, book]);

  const handleSave = async () => {
    if (!book) { return; }
    setSaving(true);
    try {
      const body: UpdateBookRequest = {
        title, publicationYear: Number(year),
        authorId: !authorId || authorId === "none" ? null : Number(authorId),
        publisherId: !publisherId || publisherId === "none" ? null : Number(publisherId),
        categoryIds: !categoryId || categoryId === "none" ? [] : [Number(categoryId)],
        description,
        language: language,
        pagesCount: Number(pagesCount),
        repurchasePrice: Number(repurchasePrice),
        originalTitle: originalTitle.trim() || null,
        originalLanguage: originalLanguage.trim() || null,
        originalPublicationYear: originalYear ? Number(originalYear) : null,
      };
      await updateBook(book.id, body);
      if (file) { await uploadBookCover(book.id, file).catch(() => toast.error("Cover failed")); }
      toast.success("Updated");
      await onSave?.(book);
      onOpenChange(false);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleAddUnits = async () => {
    if (!book || copies < 1) { return; }
    try {
      await addBookUnits(book.id, copies);
      toast.success(`${copies} copies added`);
    } catch { toast.error("Failed to add copies"); }
  };

  if (!book) { return null; }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Edit Book</DialogTitle><DialogDescription>Update details.</DialogDescription></DialogHeader>
        {loading ? <div className="py-10 text-center">Loading...</div> : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Title</Label><Input className="col-span-3" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-start gap-4"><Label className="text-right pt-2">Description</Label><Textarea className="col-span-3 min-h-[100px]" value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Author</Label><Select value={authorId} onValueChange={setAuthorId}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.authors.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Publisher</Label><Select value={publisherId} onValueChange={setPublisherId}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.publishers.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Category</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Language</Label><Input className="col-span-3" value={language} onChange={e => setLanguage(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Year</Label><Input type="number" className="col-span-3" value={year} onChange={e => setYear(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Pages Count</Label><Input type="number" className="col-span-3" value={pagesCount} onChange={e => setPagesCount(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Repurchase Price</Label><Input type="number" className="col-span-3" value={repurchasePrice} onChange={e => setRepurchasePrice(e.target.value)} /></div>
            
            <Separator className="my-2" />
            <h3 className="text-sm font-semibold col-span-4">Original Info (Optional)</h3>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Original Title</Label><Input className="col-span-3" value={originalTitle} onChange={e => setOriginalTitle(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Orig. Language</Label><Input className="col-span-3" value={originalLanguage} onChange={e => setOriginalLanguage(e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Orig. Year</Label><Input type="number" className="col-span-3" value={originalYear} onChange={e => setOriginalYear(e.target.value)} /></div>

            <Separator className="my-2" />
            <ImageUpload id="edit-cover" label="Cover" onFileSelect={setFile} initialPreviewUrl={book.coverURI} aspectRatio="cover" className="grid grid-cols-4 items-start gap-4" labelClassName="text-right pt-2" contentClassName="col-span-3" />
            <Separator className="my-2" />
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Stock</Label><div className="col-span-3 flex items-center gap-2"><Input type="number" value={copies} onChange={e => setCopies(Number(e.target.value))} className="w-20" /><Button variant="outline" size="sm" onClick={handleAddUnits} className="gap-2"><PlusIcon /> Add Copies</Button></div></div>
          </div>
        )}
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></div>
      </DialogContent>
    </Dialog>
  );
}
