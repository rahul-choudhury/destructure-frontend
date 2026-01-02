"use client";

import { useState, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";

import { uploadImages } from "@/lib/actions";
import { INSERT_IMAGE_COMMAND } from "../plugins/image-plugin";

type ImageUploadDialogProps = {
  toolbarButtonClass: string;
};

export function ImageUploadDialog({
  toolbarButtonClass,
}: ImageUploadDialogProps) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("images", file);

      const result = await uploadImages(formData);

      if (result.isSuccess && result.data.length > 0) {
        const imageUrl = result.data[0];
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: imageUrl });
        setOpen(false);
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger className={toolbarButtonClass}>
        <ImageIcon size={18} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg border border-foreground/20 bg-background p-6 shadow-xl data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium text-foreground">
              Upload Image
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded text-foreground/60 hover:text-foreground hover:bg-foreground/10">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center hover:border-foreground/40 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2
                    size={32}
                    className="text-foreground/40 animate-spin"
                  />
                  <p className="text-sm text-foreground/60">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-foreground/40" />
                  <p className="text-sm text-foreground/60">
                    Click to select an image
                  </p>
                  <p className="text-xs text-foreground/40">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
