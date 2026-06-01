"use client";

import {
  createPublisher,
  deletePublisher,
  getPublishers,
  updatePublisher,
} from "@/lib/api/publishers";
import LookupManagementTab from "./LookupManagementTab";

export default function PublishersTab() {
  return (
    <LookupManagementTab
      entityName="Publisher"
      entityNamePlural="Publishers"
      fetchItems={getPublishers}
      createItem={createPublisher}
      updateItem={updatePublisher}
      deleteItem={deletePublisher}
    />
  );
}
