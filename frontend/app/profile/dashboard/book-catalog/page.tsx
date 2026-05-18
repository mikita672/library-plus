import BookCatalogToolbar from "@/components/profile/dashboard/book-catalog/BookCatalogToolbar";

export default function BookCatalogPage() {
  return (
    <section className="space-y-4">
      <BookCatalogToolbar />

      <div className="border border-black bg-background p-6 text-sm text-muted-foreground" />
    </section>
  );
}
