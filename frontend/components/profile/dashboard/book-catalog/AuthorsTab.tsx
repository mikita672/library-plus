"use client";

import {
  createAuthor,
  deleteAuthor,
  getAuthors,
  updateAuthor,
} from "@/lib/api/authors";
import LookupManagementTab from "./LookupManagementTab";

export default function AuthorsTab() {
  return (
    <LookupManagementTab
      entityName="Author"
      entityNamePlural="Authors"
      fetchItems={getAuthors}
      createItem={createAuthor}
      updateItem={updateAuthor}
      deleteItem={deleteAuthor}
    />
  );
}
