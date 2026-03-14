"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Upload file via server-side proxy (no CORS needed)
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload image");
        }

        const { url } = await res.json();
        onChange(url);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!value ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...(() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const {
                onAnimationStart,
                onDrag,
                onDragStart,
                onDragEnd,
                refKey,
                ...props
              } = getRootProps();
              return props;
            })()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 transition-colors hover:bg-muted/50 cursor-pointer",
              isDragActive && "border-primary bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted shadow-sm">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="mt-4 flex flex-col items-center justify-center text-sm text-center">
              <p className="font-medium text-foreground">
                {isUploading
                  ? "Uploading..."
                  : "Click to upload or drag & drop"}
              </p>
              <p className="text-muted-foreground mt-1">
                SVG, PNG, JPG or GIF (max. 4MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-lg aspect-video max-h-[300px] w-full border bg-muted"
          >
            <img
              src={value}
              alt="Upload"
              className="h-full w-full object-cover"
            />
            <Button
              onClick={() => onChange("")}
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 shadow-sm"
              type="button"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
