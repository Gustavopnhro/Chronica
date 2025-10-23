import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { TimelineEntry } from "@/types/postmortem";
import { useRef } from "react";

interface TimelineProps {
  entries: TimelineEntry[];
  onChange: (entries: TimelineEntry[]) => void;
  t: (key: string) => string;
}

const generateId = () => `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const Timeline = ({ entries, onChange, t }: TimelineProps) => {
  const handleAdd = () => {
    onChange([...entries, {
      id: generateId(),
      time: '',
      actor: '',
      notes: '',
      images: [],
    }]);
  };

  const handleDelete = (id: string) => {
    onChange(entries.filter(e => e.id !== id));
  };

  const handleUpdate = (id: string, field: keyof TimelineEntry, value: any) => {
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handlePaste = async (id: string, e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const entry = entries.find(e => e.id === id);
          if (entry) {
            handleUpdate(id, 'images', [...entry.images, dataUrl]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageDelete = (entryId: string, imageIndex: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      const newImages = entry.images.filter((_, i) => i !== imageIndex);
      handleUpdate(entryId, 'images', newImages);
    }
  };

  return (
    <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          {t("Timeline")}
        </h2>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Dica: Cole imagens com Ctrl+V no campo Time
        </span>
      </div>
      
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="grid md:grid-cols-[120px_1fr_auto] gap-4 p-4 border border-border rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="space-y-2">
              <Label htmlFor={`time-${entry.id}`} className="text-xs">Time</Label>
              <Input
                id={`time-${entry.id}`}
                type="time"
                value={entry.time}
                onChange={(e) => handleUpdate(entry.id, 'time', e.target.value)}
                onPaste={(e) => handlePaste(entry.id, e)}
                className="text-sm"
              />
              <Label htmlFor={`actor-${entry.id}`} className="text-xs">Actor</Label>
              <Input
                id={`actor-${entry.id}`}
                value={entry.actor}
                onChange={(e) => handleUpdate(entry.id, 'actor', e.target.value)}
                placeholder="service/user"
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`notes-${entry.id}`} className="text-xs">Notes</Label>
              <Textarea
                id={`notes-${entry.id}`}
                value={entry.notes}
                onChange={(e) => handleUpdate(entry.id, 'notes', e.target.value)}
                placeholder="What happened? Commands, errors, dashboards."
                className="min-h-[80px] text-sm"
              />
              {entry.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {entry.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Screenshot ${idx + 1}`}
                        className="h-20 rounded-lg border border-border object-cover"
                      />
                      <button
                        onClick={() => handleImageDelete(entry.id, idx)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(entry.id)}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button onClick={handleAdd} variant="default" className="mt-4 gap-2">
        <Plus className="w-4 h-4" />
        {t("Add Entry")}
      </Button>
    </Card>
  );
};
