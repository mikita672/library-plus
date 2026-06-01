"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@phosphor-icons/react";
import { z } from "zod";
import { toast } from "sonner";
import { getAuthors } from "@/lib/api/authors";
import { createBook, addBookUnits } from "@/lib/api/books";
import { getCategories } from "@/lib/api/categories";
import { getPublishers } from "@/lib/api/publishers";
import { Author } from "@/types/book/Author";
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

const createBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  language: z.string().trim().min(1, "Language is required"),
  publicationYear: z.number().int().min(1, "Publication year is required"),
  pagesCount: z.number().int().min(1, "Pages count is required"),
  repurchasePrice: z.number().min(0, "Repurchase price cannot be negative"),
  initialCopies: z.number().int().min(0, "Cannot be negative"),
  authorId: z.string().optional(),
  publisherId: z.string().optional(),
  categoryId: z.string().optional(),
  originalTitle: z.string().optional(),
  originalLanguage: z.string().optional(),
  originalPublicationYear: z.number().int().min(1).optional(),
  coverURI: z.string().optional(),
});

type CreateBookFormValues = z.infer<typeof createBookSchema>;

function nullableString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<CreateBookFormValues>({
    resolver: zodResolver(createBookSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      language: "",
      publicationYear: new Date().getFullYear(),
      pagesCount: 1,
      repurchasePrice: 0,
      initialCopies: 1,
      authorId: "",
      publisherId: "",
      categoryId: "",
      originalTitle: "",
      originalLanguage: "",
      originalPublicationYear: undefined,
      coverURI: "",
    },
  });

  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [a, p, c] = await Promise.all([
          getAuthors(),
          getPublishers(),
          getCategories(),
        ]);
        setAuthors(a);
        setPublishers(p);
        setCategories(c);
      } catch {
        toast.error("Failed to load metadata");
      } finally {
        setLoadingLookups(false);
      }
    };

    if (open) {
      void loadLookups();
    }
  }, [open]);

  const onSubmit = async (values: CreateBookFormValues) => {
    setSubmitting(true);

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      language: values.language.trim(),
      publicationYear: values.publicationYear,
      pagesCount: values.pagesCount,
      repurchasePrice: values.repurchasePrice,
      categoryIds:
        values.categoryId && values.categoryId !== "none"
          ? [values.categoryId]
          : [],
      authorId: nullableString(values.authorId),
      publisherId: nullableString(values.publisherId),
      originalTitle: nullableString(values.originalTitle),
      originalLanguage: nullableString(values.originalLanguage),
      originalPublicationYear:
        typeof values.originalPublicationYear === "number" &&
        Number.isFinite(values.originalPublicationYear)
          ? values.originalPublicationYear
          : null,
      originalPublisherId: null,
    };

    try {
      const createdBook = await createBook(payload);

      if (values.initialCopies > 0) {
        await addBookUnits(createdBook.id, values.initialCopies);
        toast.success(
          `Book created with ${values.initialCopies} physical ${values.initialCopies === 1 ? "copy" : "copies"}`,
        );
      } else {
        toast.success("Book created successfully");
      }

      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create book",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 px-4 text-lg" type="button">
          <PlusIcon />
          Add new book
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-6" showCloseButton>
        <DialogHeader>
          <DialogTitle>Add new book</DialogTitle>
          <DialogDescription>
            Create a new book record in the catalog.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-book-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" {...form.register("title")} />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.language}>
              <FieldLabel htmlFor="language">Language</FieldLabel>
              <Input id="language" {...form.register("language")} />
              <FieldError errors={[form.formState.errors.language]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.publicationYear}>
              <FieldLabel htmlFor="publicationYear">
                Publication year
              </FieldLabel>
              <Input
                id="publicationYear"
                type="number"
                {...form.register("publicationYear", {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[form.formState.errors.publicationYear]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.pagesCount}>
              <FieldLabel htmlFor="pagesCount">Pages count</FieldLabel>
              <Input
                id="pagesCount"
                type="number"
                {...form.register("pagesCount", {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[form.formState.errors.pagesCount]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.initialCopies}>
              <FieldLabel htmlFor="initialCopies">
                Initial copies
              </FieldLabel>
              <Input
                id="initialCopies"
                type="number"
                min="0"
                {...form.register("initialCopies", {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[form.formState.errors.initialCopies]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.repurchasePrice}>
              <FieldLabel htmlFor="repurchasePrice">
                Repurchase price
              </FieldLabel>
              <Input
                id="repurchasePrice"
                type="number"
                step="0.01"
                {...form.register("repurchasePrice", {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[form.formState.errors.repurchasePrice]} />
            </Field>

            <Field>
              <FieldLabel>Author</FieldLabel>
              <Select
                value={form.watch("authorId") || "none"}
                onValueChange={(value) =>
                  form.setValue("authorId", value === "none" ? "" : value)
                }
                disabled={loadingLookups}
              >
                <SelectTrigger className="w-full">
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
            </Field>

            <Field>
              <FieldLabel>Publisher</FieldLabel>
              <Select
                value={form.watch("publisherId") || "none"}
                onValueChange={(value) =>
                  form.setValue("publisherId", value === "none" ? "" : value)
                }
                disabled={loadingLookups}
              >
                <SelectTrigger className="w-full">
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
            </Field>

            <Field>
              <FieldLabel htmlFor="categoryId">Category</FieldLabel>
              <Select
                disabled={loadingLookups}
                value={form.watch("categoryId") || "none"}
                onValueChange={(value) =>
                  form.setValue("categoryId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
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
            </Field>

            <Field>
              <FieldLabel htmlFor="originalTitle">Original title</FieldLabel>
              <Input id="originalTitle" {...form.register("originalTitle")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="originalLanguage">
                Original language
              </FieldLabel>
              <Input
                id="originalLanguage"
                {...form.register("originalLanguage")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="originalPublicationYear">
                Original publication year
              </FieldLabel>
              <Input
                id="originalPublicationYear"
                type="number"
                {...form.register("originalPublicationYear", {
                  setValueAs: (value) => {
                    if (value === "" || value === null || value === undefined) {
                      return undefined;
                    }

                    return Number(value);
                  },
                })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="coverURI">Cover URL</FieldLabel>
              <Input id="coverURI" {...form.register("coverURI")} />
            </Field>
          </FieldGroup>

          <Field data-invalid={!!form.formState.errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea id="description" {...form.register("description")} />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button form="add-book-form" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Create book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
