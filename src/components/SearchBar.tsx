import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  sender: {
    full_name: string;
    avatar_url?: string;
  };
}

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('shout_outs')
      .select(`
        id,
        content,
        created_at,
        sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url)
      `)
      .ilike('content', `%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setResults(data as any);
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 min-w-[200px] justify-start"
      >
        <Search className="h-4 w-4" />
        <span className="text-muted-foreground">Search shout-outs...</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Shout-outs</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type to search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ScrollArea className="h-96 mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Searching...</div>
            ) : results.length === 0 && query ? (
              <div className="text-center py-8 text-muted-foreground">No results found</div>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.sender.avatar_url} />
                        <AvatarFallback>{result.sender.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{result.sender.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{result.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
