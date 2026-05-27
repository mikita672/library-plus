import BookCatalogTable from "@/components/profile/dashboard/book-catalog/BookCatalogTable";
import BookCatalogToolbar from "@/components/profile/dashboard/book-catalog/BookCatalogToolbar";

export default function BookCatalogPage() {
  return (
    <section className="space-y-4">
      <BookCatalogToolbar />
      <BookCatalogTable />
    </section>
  );
}
