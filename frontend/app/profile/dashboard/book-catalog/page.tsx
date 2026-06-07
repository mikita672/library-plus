"use client";

import { Suspense } from "react";

import AuthorsTab from "@/components/profile/dashboard/book-catalog/AuthorsTab";
import BooksTab from "@/components/profile/dashboard/book-catalog/BooksTab";
import PublishersTab from "@/components/profile/dashboard/book-catalog/PublishersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CategoriesTab from "@/components/profile/dashboard/book-catalog/CategoriesTab";

import { useSearchParams, useRouter } from "next/navigation";

function BookCatalogTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "books";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="books">Books</TabsTrigger>
        <TabsTrigger value="authors">Authors</TabsTrigger>
        <TabsTrigger value="publishers">Publishers</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
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

      <TabsContent value="categories">
        <CategoriesTab />
      </TabsContent>
    </Tabs>
  );
}

export default function BookCatalogPage() {
  return (
    <section className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <BookCatalogTabs />
      </Suspense>
    </section>
  );
}
