"use client";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api/categories";
import LookupManagementTab from "./LookupManagementTab";

export default function CategoriesTab() {
  return (
    <LookupManagementTab
      entityName="Category"
      entityNamePlural="Categories"
      paramKey="categoryIds"
      fetchItems={() => getCategories(true)}
      createItem={createCategory}
      updateItem={updateCategory}
      deleteItem={deleteCategory}
    />
  );
}
