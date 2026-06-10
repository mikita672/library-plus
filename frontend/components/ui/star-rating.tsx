"use client";

import { Star } from "@phosphor-icons/react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= Math.round(rating);

        return (
          <Star
            key={i}
            size={size}
            weight={isFilled ? "fill" : "regular"}
            className={`${isFilled ? "text-amber-400" : "text-muted-foreground/40"} ${interactive ? "cursor-pointer hover:text-amber-300 transition-colors" : ""}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(starIndex) : undefined}
          />
        );
      })}
    </div>
  );
}
