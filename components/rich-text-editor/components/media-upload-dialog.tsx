"use client";

import { useState, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";

import { uploadMedia } from "@/lib/actions";
import { INSERT_IMAGE_COMMAND } from "../plugins/image-plugin";
import { INSERT_VIDEO_COMMAND } from "../plugins/video-plugin";

type MediaUploadDialogProps = {
  toolbarButtonClass: string;
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

function isVideoFile(file: File): boolean {
  return VIDEO_TYPES.includes(file.type);
}

export function MediaUploadDialog({
  toolbarButtonClass,
}: MediaUploadDialogProps) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file) && !isVideoFile(file)) {
      setError("Unsupported file type");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("media", file);

      const result = await uploadMedia(formData);

      if (result.isSuccess && result.data.length > 0) {
        const mediaUrl = result.data[0];

        if (isImageFile(file)) {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: mediaUrl });
        } else {
          editor.dispatchCommand(INSERT_VIDEO_COMMAND, { src: mediaUrl });
        }

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
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground-20 bg-background p-6 shadow-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-medium text-foreground">
              Upload Media
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-foreground-60 hover:bg-foreground-10 hover:text-foreground">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-foreground-20 p-8 text-center transition-colors hover:border-foreground-40"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2
                    size={32}
                    className="animate-spin text-foreground-40"
                  />
                  <p className="text-sm text-foreground-60">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-foreground-40" />
                  <p className="text-sm text-foreground-60">
                    Click to select an image or video
                  </p>
                  <p className="text-xs text-foreground-40">
                    Images: JPG, PNG, GIF, WebP
                  </p>
                  <p className="text-xs text-foreground-40">
                    Videos: MP4, WebM, OGG
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
