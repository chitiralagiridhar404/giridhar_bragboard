import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, UserPlus, Sparkles, Image as ImageIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);
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
      setDialogOpen(false);
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-primary-glow hover:shadow-[var(--shadow-elegant)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
          Create Amazing Shout-out
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            Share Recognition
          </DialogTitle>
          <DialogDescription>
            Celebrate someone's amazing work and make their day special ✨
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="content" className="text-base font-semibold flex items-center gap-2">
              Your Message
              <span className="text-xs text-muted-foreground font-normal">(Share what made them special)</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something heartfelt... Tell them why they're awesome, what they did that impressed you, or how they made a difference! 🌟"
              className="min-h-[140px] resize-none text-base border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Add Details</Label>
            <div className="flex flex-wrap gap-3">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="border-2 hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => {
                      if (profiles.length === 0) fetchProfiles();
                    }}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Tag People
                    {taggedUsers.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {taggedUsers.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-0">
                  <Command>
                    <CommandInput placeholder="Search people..." className="h-12" />
                    <CommandList>
                      <CommandEmpty>No one found.</CommandEmpty>
                      <CommandGroup>
                        {profiles.map((profile) => (
                          <CommandItem
                            key={profile.user_id}
                            onSelect={() => toggleUser(profile)}
                            className="py-3"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{profile.full_name || "Unknown"}</div>
                                <div className="text-sm text-muted-foreground">
                                  {profile.role} • {profile.department}
                                </div>
                              </div>
                              {taggedUsers.find((u) => u.user_id === profile.user_id) && (
                                <div className="text-primary text-xl">✓</div>
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
                  size="lg"
                  className="border-2 hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Add Image
                  {imagePreview && (
                    <Badge variant="secondary" className="ml-2">✓</Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {taggedUsers.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-sm font-semibold text-muted-foreground">Tagged People</Label>
              <div className="flex flex-wrap gap-2">
                {taggedUsers.map((user) => (
                  <Badge 
                    key={user.user_id} 
                    variant="secondary" 
                    className="gap-2 py-2 px-3 text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {user.full_name || "Unknown"}
                    <button
                      type="button"
                      onClick={() => toggleUser(user)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-primary/20 animate-in fade-in zoom-in-95 duration-300">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 transition-all shadow-lg hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading} 
            size="lg"
            className="w-full text-lg h-12 bg-gradient-to-r from-primary to-primary-glow hover:shadow-[var(--shadow-elegant)] transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Posting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Share the Love
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
