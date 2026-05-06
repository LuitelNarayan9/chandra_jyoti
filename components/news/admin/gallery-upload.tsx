"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────

interface GalleryUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

// ─── Animation variants ───────────────────────────────────────

const imageVariants = {
  initial: { opacity: 0, scale: 0.8, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.7, y: -8, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────

export function GalleryUpload({
  value,
  onChange,
  maxImages = 5,
  maxSizeMB = 2,
  disabled,
}: GalleryUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const remaining = maxImages - value.length;
  const isFull = remaining <= 0;
  const maxBytes = maxSizeMB * 1024 * 1024;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Limit to remaining slots
      const filesToUpload = acceptedFiles.slice(0, remaining);
      if (filesToUpload.length === 0) {
        toast.error(`Maximum ${maxImages} images allowed.`);
        return;
      }

      // Validate file sizes
      const oversized = filesToUpload.filter((f) => f.size > maxBytes);
      if (oversized.length > 0) {
        toast.error(
          `${oversized.length} file(s) exceed ${maxSizeMB}MB limit.`
        );
        return;
      }

      setUploadingCount(filesToUpload.length);

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Upload failed");
          }

          const { url } = await res.json();
          return url as string;
        });

        const newUrls = await Promise.all(uploadPromises);
        onChange([...value, ...newUrls]);
        toast.success(
          `${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded.`
        );
      } catch (error) {
        console.error("Gallery upload error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload images."
        );
      } finally {
        setUploadingCount(0);
      }
    },
    [value, onChange, remaining, maxImages, maxBytes, maxSizeMB]
  );

  const removeImage = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: remaining,
    disabled: disabled || isFull || uploadingCount > 0,
  });

  const isUploading = uploadingCount > 0;

  return (
    <div className="space-y-3">
      {/* Gallery grid */}
      <AnimatePresence mode="popLayout">
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
          >
            {value.map((url, index) => (
              <motion.div
                key={url}
                variants={imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted shadow-sm"
              >
                <img
                  src={url}
                  alt={`Gallery image ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Remove button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  className={cn(
                    "absolute top-1.5 right-1.5 h-6 w-6 rounded-full",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "shadow-md"
                  )}
                >
                  <X className="h-3 w-3" />
                </Button>
                {/* Index badge */}
                <div className="absolute bottom-1.5 left-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[0.6rem] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone (only show if not full) */}
      {!isFull && (
        <div
          {...(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...props } =
              getRootProps();
            return props;
          })()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed",
            "px-6 py-6 transition-all duration-200 cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shadow-sm mb-2",
              isDragActive
                ? "bg-primary/10"
                : "bg-muted"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <ImagePlus
                className={cn(
                  "h-5 w-5",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )}
              />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">
            {isUploading
              ? `Uploading ${uploadingCount} image${uploadingCount > 1 ? "s" : ""}…`
              : isDragActive
                ? "Drop images here"
                : "Add photos"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {remaining} slot{remaining !== 1 ? "s" : ""} remaining · Max {maxSizeMB}MB each
          </p>
        </div>
      )}

      {/* Counter badge */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground/60">
          {value.length}/{maxImages} photos
        </p>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            className="text-xs text-destructive/60 hover:text-destructive transition-colors"
          >
            Remove all
          </button>
        )}
      </div>
    </div>
  );
}
