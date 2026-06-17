"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@phosphor-icons/react";
import { z } from "zod";
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
  DialogFooter,
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Props {
  book: BookCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (book: BookCard) => Promise<void>;
}

const currentYear = new Date().getFullYear();

const schema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z.string().trim().min(1, "Required"),
  language: z.string().trim().min(1, "Required"),
  publicationYear: z.number().int().min(1, "Must be greater than 0").max(currentYear, "Cannot be in the future"),
  pagesCount: z.number().int().min(1, "Must be greater than 0"),
  repurchasePrice: z.number().min(0, "Cannot be negative"),
  authorId: z.string().optional(),
  publisherId: z.string().optional(),
  categoryId: z.string().optional(),
  originalTitle: z.string().optional(),
  originalLanguage: z.string().optional(),
  originalPublicationYear: z.union([
    z.number().int().max(currentYear, "Cannot be in the future"),
    z.nan().transform(() => undefined)
  ]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditBookModal({ book, open, onOpenChange, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState({ authors: [] as Author[], publishers: [] as Publisher[], categories: [] as Category[] });
  
  const [file, setFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", language: "", publicationYear: new Date().getFullYear(), pagesCount: 1, repurchasePrice: 0 },
  });

  useEffect(() => {
    if (!open || !book) { return; }
    (async () => {
      setLoading(true);
      try {
        const [details, a, p, c] = await Promise.all([getBookById(book.id), getAuthors(), getPublishers(), getCategories()]);
        
        form.reset({
          title: details.title || "",
          description: details.description || "",
          authorId: details.author?.id?.toString() || "none",
          publisherId: details.publisher?.id?.toString() || "none",
          categoryId: details.categories?.[0]?.id?.toString() || "none",
          publicationYear: details.publicationYear || new Date().getFullYear(),
          language: details.language || "English",
          pagesCount: details.pagesCount || 100,
          repurchasePrice: details.repurchasePrice || 10,
          originalTitle: details.originalTitle || "",
          originalLanguage: details.originalLanguage || "",
          originalPublicationYear: details.originalPublicationYear || undefined,
        });

        setLookups({ authors: a, publishers: p, categories: c });
      } finally { setLoading(false); }
    })();
  }, [open, book, form]);

  const onSubmit = async (values: FormValues) => {
    if (!book) { return; }
    setSaving(true);
    try {
      const body: UpdateBookRequest = {
        ...values,
        categoryIds: values.categoryId && values.categoryId !== "none" ? [Number(values.categoryId)] : [],
        authorId: values.authorId?.trim() && values.authorId !== "none" ? Number(values.authorId) : null,
        publisherId: values.publisherId?.trim() && values.publisherId !== "none" ? Number(values.publisherId) : null,
        originalTitle: values.originalTitle?.trim() || null,
        originalLanguage: values.originalLanguage?.trim() || null,
        originalPublicationYear: values.originalPublicationYear || null,
        originalPublisherId: null,
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
      <DialogContent className="sm:max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Book</DialogTitle><DialogDescription>Update details.</DialogDescription></DialogHeader>
        {loading ? <div className="py-10 text-center">Loading...</div> : (
          <>
            <form id="edit-book-form" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.title}><FieldLabel>Title</FieldLabel><Input {...form.register("title")} /><FieldError>{form.formState.errors.title?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.authorId}><FieldLabel>Author</FieldLabel><Controller name="authorId" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select Author" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.authors.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent></Select>
                )} /><FieldError>{form.formState.errors.authorId?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.publisherId}><FieldLabel>Publisher</FieldLabel><Controller name="publisherId" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select Publisher" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.publishers.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select>
                )} /><FieldError>{form.formState.errors.publisherId?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.categoryId}><FieldLabel>Category</FieldLabel><Controller name="categoryId" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select>
                )} /><FieldError>{form.formState.errors.categoryId?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.language}><FieldLabel>Language</FieldLabel><Input {...form.register("language")} /><FieldError>{form.formState.errors.language?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.publicationYear}><FieldLabel>Publication Year</FieldLabel><Input type="number" {...form.register("publicationYear", { valueAsNumber: true })} /><FieldError>{form.formState.errors.publicationYear?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.pagesCount}><FieldLabel>Pages</FieldLabel><Input type="number" {...form.register("pagesCount", { valueAsNumber: true })} /><FieldError>{form.formState.errors.pagesCount?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.repurchasePrice}><FieldLabel>Repurchase Price ($)</FieldLabel><Input type="number" step="0.01" {...form.register("repurchasePrice", { valueAsNumber: true })} /><FieldError>{form.formState.errors.repurchasePrice?.message}</FieldError></Field>
                <ImageUpload id="coverFile" label="Book cover" onFileSelect={setFile} initialPreviewUrl={book.coverURI} aspectRatio="cover" labelClassName="text-sm font-medium" />
              </FieldGroup>
              <Field data-invalid={!!form.formState.errors.description}><FieldLabel>Description</FieldLabel><Textarea {...form.register("description")} /><FieldError>{form.formState.errors.description?.message}</FieldError></Field>
              <Collapsible className="border border-border rounded-md p-0"><CollapsibleTrigger asChild><Button type="button" variant="ghost" size="sm" className="w-full flex justify-between p-3 h-auto">Original work info (optional)</Button></CollapsibleTrigger><CollapsibleContent className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 pt-0">
                <Field data-invalid={!!form.formState.errors.originalTitle}><FieldLabel>Original Title</FieldLabel><Input {...form.register("originalTitle")} /><FieldError>{form.formState.errors.originalTitle?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.originalLanguage}><FieldLabel>Original Language</FieldLabel><Input {...form.register("originalLanguage")} /><FieldError>{form.formState.errors.originalLanguage?.message}</FieldError></Field>
                <Field data-invalid={!!form.formState.errors.originalPublicationYear}><FieldLabel>Original Year</FieldLabel><Input type="number" {...form.register("originalPublicationYear", { valueAsNumber: true })} /><FieldError>{form.formState.errors.originalPublicationYear?.message}</FieldError></Field>
              </CollapsibleContent></Collapsible>
            </form>
            
            <Separator className="my-2" />
            <div className="flex items-center gap-4 justify-between border border-border rounded-md p-3">
              <Label className="font-semibold">Add More Copies</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={copies} onChange={e => setCopies(Number(e.target.value))} className="w-20" min={1} />
                <Button variant="outline" size="sm" onClick={handleAddUnits} className="gap-2"><PlusIcon /> Add Copies</Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button form="edit-book-form" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
