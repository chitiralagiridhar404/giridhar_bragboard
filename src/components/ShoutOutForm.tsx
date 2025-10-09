import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Profile {
  user_id: string;
  full_name: string;
  role: string;
  department: string;
}

export const ShoutOutForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [taggedUsers, setTaggedUsers] = useState<Profile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, role, department");

    if (!error && data) {
      setProfiles(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const toggleUser = (profile: Profile) => {
    if (taggedUsers.find((u) => u.user_id === profile.user_id)) {
      setTaggedUsers(taggedUsers.filter((u) => u.user_id !== profile.user_id));
    } else {
      setTaggedUsers([...taggedUsers, profile]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write a message for your shout-out.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;

      // Upload image if present
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("shout-outs")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("shout-outs")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create shout-out
      const { data: shoutOut, error: shoutOutError } = await supabase
        .from("shout_outs")
        .insert({
          sender_id: user.id,
          content,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (shoutOutError) throw shoutOutError;

      // Add tagged recipients
      if (taggedUsers.length > 0) {
        const recipients = taggedUsers.map((profile) => ({
          shout_out_id: shoutOut.id,
          recipient_id: profile.user_id,
        }));

        const { error: recipientsError } = await supabase
          .from("shout_out_recipients")
          .insert(recipients);

        if (recipientsError) throw recipientsError;
      }

      toast({
        title: "Shout-out posted!",
        description: "Your shout-out has been shared successfully.",
      });

      // Reset form
      setContent("");
      setImage(null);
      setImagePreview(null);
      setTaggedUsers([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
      <div>
        <Label htmlFor="content">Share a Shout-out</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Give recognition to someone who made a difference..."
          className="mt-2 min-h-[100px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (profiles.length === 0) fetchProfiles();
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Tag People
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search people..." />
              <CommandList>
                <CommandEmpty>No one found.</CommandEmpty>
                <CommandGroup>
                  {profiles.map((profile) => (
                    <CommandItem
                      key={profile.user_id}
                      onSelect={() => toggleUser(profile)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{profile.full_name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {profile.role} • {profile.department}
                          </div>
                        </div>
                        {taggedUsers.find((u) => u.user_id === profile.user_id) && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="relative">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </div>
      </div>

      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taggedUsers.map((user) => (
            <Badge key={user.user_id} variant="secondary" className="gap-1">
              {user.full_name || "Unknown"}
              <button
                type="button"
                onClick={() => toggleUser(user)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {imagePreview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Posting..." : "Post Shout-out"}
      </Button>
    </form>
  );
};
