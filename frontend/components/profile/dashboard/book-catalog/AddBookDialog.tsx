"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@phosphor-icons/react";
import { z } from "zod";
import { toast } from "sonner";

import { getAuthors } from "@/lib/api/authors";
import { createBook, addBookUnits } from "@/lib/api/books";
import { uploadBookCover } from "@/lib/api/media";
import { getCategories } from "@/lib/api/categories";
import { getPublishers } from "@/lib/api/publishers";
import { Author } from "@/types/book/Author";
import { Category } from "@/types/book/Category";
import { Publisher } from "@/types/book/Publisher";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const schema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z.string().trim().min(1, "Required"),
  language: z.string().trim().min(1, "Required"),
  publicationYear: z.number().int().min(1),
  pagesCount: z.number().int().min(1),
  repurchasePrice: z.number().min(0),
  initialCopies: z.number().int().min(0),
  authorId: z.string().optional(),
  publisherId: z.string().optional(),
  categoryId: z.string().optional(),
  originalTitle: z.string().optional(),
  originalLanguage: z.string().optional(),
  originalPublicationYear: z.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AddBookDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lookups, setLookups] = useState({ authors: [] as Author[], publishers: [] as Publisher[], categories: [] as Category[] });
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", language: "", publicationYear: new Date().getFullYear(), pagesCount: 1, repurchasePrice: 0, initialCopies: 1 },
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [a, p, c] = await Promise.all([getAuthors(), getPublishers(), getCategories()]);
        setLookups({ authors: a, publishers: p, categories: c });
      } catch { toast.error("Metadata load failed"); }
    })();
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const payload = {
      ...values,
      categoryIds: values.categoryId && values.categoryId !== "none" ? [Number(values.categoryId)] : [],
      authorId: values.authorId?.trim() && values.authorId !== "none" ? Number(values.authorId) : null,
      publisherId: values.publisherId?.trim() && values.publisherId !== "none" ? Number(values.publisherId) : null,
      originalTitle: values.originalTitle?.trim() || null,
      originalLanguage: values.originalLanguage?.trim() || null,
      originalPublicationYear: values.originalPublicationYear || null,
      originalPublisherId: null,
    };

    try {
      const book = await createBook(payload);
      if (file) await uploadBookCover(book.id, file).catch(() => toast.error("Cover upload failed"));
      if (values.initialCopies > 0) await addBookUnits(book.id, values.initialCopies);
      
      toast.success("Book created");
      form.reset();
      setFile(null);
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="h-10 px-4 text-lg"><PlusIcon /> Add book</Button></DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-6">
        <DialogHeader><DialogTitle>Add new book</DialogTitle><DialogDescription>Create a record.</DialogDescription></DialogHeader>
        <form id="add-book-form" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.title}><FieldLabel>Title</FieldLabel><Input {...form.register("title")} /><FieldError>{form.formState.errors.title?.message}</FieldError></Field>
            <Field><FieldLabel>Author</FieldLabel><Controller name="authorId" control={form.control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select Author" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.authors.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent></Select>
            )} /></Field>
            <Field><FieldLabel>Publisher</FieldLabel><Controller name="publisherId" control={form.control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select Publisher" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.publishers.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select>
            )} /></Field>
            <Field><FieldLabel>Category</FieldLabel><Controller name="categoryId" control={form.control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{lookups.categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select>
            )} /></Field>
            <Field><FieldLabel>Language</FieldLabel><Input {...form.register("language")} /></Field>
            <Field><FieldLabel>Publication Year</FieldLabel><Input type="number" {...form.register("publicationYear", { valueAsNumber: true })} /></Field>
            <Field><FieldLabel>Pages</FieldLabel><Input type="number" {...form.register("pagesCount", { valueAsNumber: true })} /></Field>
            <Field><FieldLabel>Repurchase Price ($)</FieldLabel><Input type="number" step="0.01" {...form.register("repurchasePrice", { valueAsNumber: true })} /></Field>
            <Field><FieldLabel>Initial Copies</FieldLabel><Input type="number" {...form.register("initialCopies", { valueAsNumber: true })} /></Field>
            <ImageUpload id="coverFile" label="Book cover" onFileSelect={setFile} aspectRatio="cover" labelClassName="text-sm font-medium" />
          </FieldGroup>
          <Field><FieldLabel>Description</FieldLabel><Textarea {...form.register("description")} /></Field>
          <Collapsible className="border border-black p-3"><CollapsibleTrigger asChild><Button variant="ghost" size="sm">Original work info (optional)</Button></CollapsibleTrigger><CollapsibleContent className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <Field><FieldLabel>Original Title</FieldLabel><Input {...form.register("originalTitle")} /></Field>
            <Field><FieldLabel>Original Language</FieldLabel><Input {...form.register("originalLanguage")} /></Field>
            <Field><FieldLabel>Original Year</FieldLabel><Input type="number" {...form.register("originalPublicationYear", { valueAsNumber: true })} /></Field>
          </CollapsibleContent></Collapsible>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button form="add-book-form" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
