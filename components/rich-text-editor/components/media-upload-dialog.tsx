import { useState, useRef, useEffect } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ImageIcon, X, Upload, Loader2, Film } from "lucide-react";

import { uploadMedia } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { INSERT_IMAGE_COMMAND } from "../plugins/image-plugin";
import { INSERT_VIDEO_COMMAND } from "../plugins/video-plugin";

type MediaUploadDialogProps = {
  toolbarButtonClass: string;
  children?: React.ReactNode;
};

type MediaFilter = "ALL" | "IMAGE" | "VIDEO";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg"];

function isVideoUrl(url: string): boolean {
  const urlWithoutQuery = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => urlWithoutQuery.endsWith(ext));
}

function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

function isVideoFile(file: File): boolean {
  return VIDEO_TYPES.includes(file.type);
}

export function MediaUploadDialog({
  toolbarButtonClass,
  children,
}: MediaUploadDialogProps) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("ALL");
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaCache, setMediaCache] = useState<Record<MediaFilter, string[]>>({
    ALL: [],
    IMAGE: [],
    VIDEO: [],
  });
  const [fetchedFilters, setFetchedFilters] = useState<Set<MediaFilter>>(
    new Set(),
  );

  const mediaList = mediaCache[mediaFilter];

  useEffect(() => {
    const fetchMediaList = async (filter: MediaFilter) => {
      setIsLoadingMedia(true);
      try {
        const res = await fetch(`/api/admin/media?type=${filter}`);
        const data = await res.json();
        if (data.isSuccess) {
          setMediaCache((prev) => ({ ...prev, [filter]: data.data }));
        }
        setFetchedFilters((prev) => new Set(prev).add(filter));
      } catch {
        setFetchedFilters((prev) => new Set(prev).add(filter));
      } finally {
        setIsLoadingMedia(false);
      }
    };

    if (open && !fetchedFilters.has(mediaFilter)) {
      fetchMediaList(mediaFilter);
    }
  }, [open, mediaFilter, fetchedFilters]);

  const handleMediaSelect = (url: string) => {
    if (isVideoUrl(url)) {
      editor.dispatchCommand(INSERT_VIDEO_COMMAND, { src: url });
    } else {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url });
    }
    setOpen(false);
  };

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
      setMediaFilter("ALL");
      setMediaCache({ ALL: [], IMAGE: [], VIDEO: [] });
      setFetchedFilters(new Set());
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger className={toolbarButtonClass}>
        <ImageIcon size={18} />
        {children}
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
              className="cursor-pointer rounded-lg border-2 border-dashed border-foreground-20 p-6 text-center transition-colors hover:border-foreground-40"
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
                    Images: JPG, PNG, GIF, WebP | Videos: MP4, WebM, OGG
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-foreground-20" />
              <span className="text-xs text-foreground-40">
                Or select from library
              </span>
              <div className="h-px flex-1 bg-foreground-20" />
            </div>

            <div className="flex gap-1">
              {(["ALL", "IMAGE", "VIDEO"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setMediaFilter(filter)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    mediaFilter === filter
                      ? "bg-foreground text-background"
                      : "bg-foreground-10 text-foreground-60 hover:bg-foreground-20",
                  )}
                >
                  {filter === "ALL"
                    ? "All"
                    : filter === "IMAGE"
                      ? "Images"
                      : "Videos"}
                </button>
              ))}
            </div>

            <div className="max-h-48 min-h-48 overflow-y-auto rounded-lg border border-foreground-10 bg-foreground-5 p-2">
              {isLoadingMedia ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-md bg-foreground-20"
                    />
                  ))}
                </div>
              ) : mediaList.length === 0 ? (
                <div className="flex min-h-44 items-center justify-center">
                  <p className="text-sm text-foreground-40">No media found</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {mediaList.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => handleMediaSelect(url)}
                      className="group relative aspect-square overflow-hidden rounded-md bg-foreground-10 transition-transform hover:scale-105 focus:ring-2 focus:ring-foreground-40 focus:outline-none"
                    >
                      {isVideoUrl(url) ? (
                        <>
                          <video
                            src={url}
                            className="h-full w-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Film size={20} className="text-white" />
                          </div>
                        </>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
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
