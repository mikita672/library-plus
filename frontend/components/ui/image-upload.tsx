"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "./input";
import { FieldLabel } from "./field";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null,
  );

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(initialPreviewUrl || null);
    }
  }, [selectedFile, initialPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileSelect(file);
  };

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
