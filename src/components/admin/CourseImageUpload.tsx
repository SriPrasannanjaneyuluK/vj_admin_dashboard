import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { uploadAdminImage } from "@/lib/adminApi";

type CourseImageUploadProps = {
  label: string;
  help?: string;
  value: string;
  onChange: (url: string) => void;
  accessToken: string;
  aspectHint?: string;
};

export function CourseImageUpload({
  label,
  help,
  value,
  onChange,
  accessToken,
  aspectHint = "16:10",
}: CourseImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadAdminImage(accessToken, file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {help && <p className="text-xs text-muted">{help}</p>}

      <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-4">
        {value ? (
          <div className="relative aspect-[16/10] max-w-md overflow-hidden rounded-xl border border-border">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted">
            <ImagePlus size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Recommended ratio {aspectHint}</p>
            <p className="text-xs mt-1">JPG, PNG or WebP · max 5 MB</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload to Cloudinary"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>

        <label className="block mt-4 text-xs text-muted">
          Or paste Cloudinary / image URL
          <input
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
