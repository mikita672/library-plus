"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { createReview } from "@/lib/api/reviews";
import { toast } from "sonner";

interface LeaveReviewDialogProps {
  bookId: number | null;
  bookTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeaveReviewDialog({
  bookId,
  bookTitle,
  onClose,
  onSuccess,
}: LeaveReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || bookId === null) return;

    setSubmitting(true);
    try {
      const success = await createReview(bookId, rating, reviewText || null);
      if (success) {
        toast.success("Review submitted successfully");
        onSuccess();
        handleClose();
      } else {
        toast.error("Failed to submit review. You may have already reviewed this book.");
      }
    } catch {
      toast.error("An error occurred while submitting the review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText("");
    onClose();
  };

  return (
    <Dialog open={bookId !== null} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>{bookTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Your rating</span>
            <StarRating
              rating={rating}
              size={28}
              interactive
              onRatingChange={setRating}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Review (optional)</span>
            <Textarea
              placeholder="Share your thoughts about this book..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || submitting}>
            {submitting ? "Submitting..." : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
