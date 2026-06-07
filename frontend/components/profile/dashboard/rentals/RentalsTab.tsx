"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEnrichedReservations } from "@/hooks/useEnrichedReservations";

import RentalsTable from "./RentalsTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Reserved", label: "Pending" },
  { value: "Taken", label: "Rented" },
  { value: "Returned", label: "Returned" },
  { value: "Overdue", label: "Overdue" },
];

export default function RentalsTab() {
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 500);

  const { reservations, loading, error, totalPages, refetch } = useEnrichedReservations({
    pageNumber,
    statusFilter,
    debouncedSearch,
  });

  useEffect(() => { setPageNumber(1); }, [debouncedSearch, statusFilter]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setInputValue("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 max-w-md mr-4 gap-2">
          <Input
            className="h-10 text-base"
            placeholder="Search reservations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">Error loading reservations</div>
      ) : (
        <div className="flex flex-col justify-between">
          <RentalsTable reservations={reservations} onRefresh={refetch} />
          <PaginationControls pageNumber={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
        </div>
      )}
    </div>
  );
}
