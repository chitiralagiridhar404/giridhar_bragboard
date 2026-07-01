import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
  userId: string;
  currentUrl: string | null;
  fallback: string;
  onUploaded: (url: string | null) => void;
}

export function AvatarUpload({ userId, currentUrl, fallback, onUploaded }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    return data?.signedUrl ?? null;
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const signed = await getSignedUrl(path);
      const { error: profErr } = await supabase.from("profiles").update({ avatar_url: signed }).eq("user_id", userId);
      if (profErr) throw profErr;
      onUploaded(signed);
      toast.success("Profile picture updated! ✨");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", userId);
      if (error) throw error;
      onUploaded(null);
      toast.success("Profile picture removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
        <Avatar className="h-28 w-28 relative border-4 border-card shadow-elegant">
          <AvatarImage src={currentUrl || ""} />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
            {fallback}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elegant hover:scale-110 transition-transform"
          aria-label="Change avatar"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 text-center sm:text-left space-y-2">
        <h3 className="font-bold text-lg">Profile Picture</h3>
        <p className="text-sm text-muted-foreground">PNG, JPG or WebP. Max 5MB.</p>
        <div className="flex gap-2 justify-center sm:justify-start pt-1">
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-2 rounded-xl">
            <Camera className="h-4 w-4" /> Upload
          </Button>
          {currentUrl && (
            <Button size="sm" variant="ghost" onClick={handleRemove} disabled={uploading} className="gap-2 rounded-xl text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
