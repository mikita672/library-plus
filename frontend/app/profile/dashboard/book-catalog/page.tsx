"use client";

import { Suspense } from "react";

import AuthorsTab from "@/components/profile/dashboard/book-catalog/AuthorsTab";
import BooksTab from "@/components/profile/dashboard/book-catalog/BooksTab";
import PublishersTab from "@/components/profile/dashboard/book-catalog/PublishersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CategoriesTab from "@/components/profile/dashboard/book-catalog/CategoriesTab";

export default function BookCatalogPage() {
  return (
    <section className="space-y-4">
      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="publishers">Publishers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <Suspense fallback={<div>Loading books...</div>}>
            <BooksTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="authors">
          <AuthorsTab />
        </TabsContent>

        <TabsContent value="publishers">
          <PublishersTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
