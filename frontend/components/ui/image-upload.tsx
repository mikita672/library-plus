"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "./input";
import { Label } from "./label";

interface ImageUploadProps {
  label: string;
  id: string;
  onFileSelect: (file: File | null) => void;
  initialPreviewUrl?: string | null;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
  aspectRatio?: "square" | "cover";
}

export function ImageUpload({
  label,
  id,
  onFileSelect,
  initialPreviewUrl,
  className = "",
  labelClassName = "",
  contentClassName = "",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(initialPreviewUrl || null);
    }
    onFileSelect(file);
  };

  useEffect(() => {
    setPreviewUrl(initialPreviewUrl || null);
  }, [initialPreviewUrl]);

  const containerAspect =
    aspectRatio === "cover" ? "aspect-[2/3] h-48" : "size-24";

  return (
    <div className={className}>
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <div className={`space-y-3 ${contentClassName}`}>
        <Input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {previewUrl && (
          <div
            className={`relative overflow-hidden rounded-md border bg-muted ${containerAspect}`}
          >
            <Image
              src={previewUrl}
              alt="Upload preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );
}
