"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  pageNumber,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-4 mt-auto">
      <Button
        variant="outline"
        size="sm"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {pageNumber} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={pageNumber >= totalPages}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Next
      </Button>
    </div>
  );
}
