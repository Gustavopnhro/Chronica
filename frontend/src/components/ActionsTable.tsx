import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Action } from "@/types/postmortem";

interface ActionsTableProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
  t: (key: string) => string;
}

export const ActionsTable = ({ actions, onChange, t }: ActionsTableProps) => {
  const handleAdd = () => {
    onChange([...actions, {
      action: '',
      owner: '',
      priority: 'P2',
      due: '',
      status: 'Open',
    }]);
  };

  const handleDelete = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof Action, value: any) => {
    onChange(actions.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  return (
    <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-accent rounded-full"></span>
        {t("Corrective & Preventive Actions (CAPA)")}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 text-sm font-semibold text-muted-foreground">{t("Action")}</th>
              <th className="text-left p-2 text-sm font-semibold text-muted-foreground">{t("Owner")}</th>
              <th className="text-left p-2 text-sm font-semibold text-muted-foreground">{t("Priority")}</th>
              <th className="text-left p-2 text-sm font-semibold text-muted-foreground">{t("Due")}</th>
              <th className="text-left p-2 text-sm font-semibold text-muted-foreground">{t("Status")}</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, idx) => (
              <tr key={idx} className="border-b border-border/50">
                <td className="p-2">
                  <Input
                    value={action.action}
                    onChange={(e) => handleUpdate(idx, 'action', e.target.value)}
                    placeholder="e.g., Add circuit breaker to service X"
                    className="text-sm"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={action.owner}
                    onChange={(e) => handleUpdate(idx, 'owner', e.target.value)}
                    placeholder="team or person"
                    className="text-sm"
                  />
                </td>
                <td className="p-2">
                  <Select value={action.priority} onValueChange={(v: any) => handleUpdate(idx, 'priority', v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Input
                    type="date"
                    value={action.due}
                    onChange={(e) => handleUpdate(idx, 'due', e.target.value)}
                    className="text-sm"
                  />
                </td>
                <td className="p-2">
                  <Select value={action.status} onValueChange={(v: any) => handleUpdate(idx, 'status', v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(idx)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Button onClick={handleAdd} variant="default" className="mt-4 gap-2">
        <Plus className="w-4 h-4" />
        {t("Add Action")}
      </Button>
    </Card>
  );
};
