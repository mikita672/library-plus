"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthorsTab from "@/components/profile/dashboard/book-catalog/AuthorsTab";
import PublishersTab from "@/components/profile/dashboard/book-catalog/PublishersTab";
import BooksTab from "@/components/profile/dashboard/book-catalog/BooksTab";

export default function BookCatalogPage() {
  return (
    <section className="space-y-4">
      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="publishers">Publishers</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
        </TabsList>

        <TabsContent value="authors">
          <AuthorsTab />
        </TabsContent>

        <TabsContent value="publishers">
          <PublishersTab />
        </TabsContent>

        <TabsContent value="books">
          <BooksTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
