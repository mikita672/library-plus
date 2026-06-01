"use client";

import AuthorsTab from "@/components/profile/dashboard/book-catalog/AuthorsTab";
import BooksTab from "@/components/profile/dashboard/book-catalog/BooksTab";
import PublishersTab from "@/components/profile/dashboard/book-catalog/PublishersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookCatalogPage() {
  return (
    <section className="space-y-4">
      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="publishers">Publishers</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <BooksTab />
        </TabsContent>

        <TabsContent value="authors">
          <AuthorsTab />
        </TabsContent>

        <TabsContent value="publishers">
          <PublishersTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
