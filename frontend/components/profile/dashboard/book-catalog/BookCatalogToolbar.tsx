"use client";

import AddBookDialog from "./AddBookDialog";

export default function BookCatalogToolbar() {
  return (
    <div className="flex items-center justify-end">
      <AddBookDialog />
    </div>
  );
}