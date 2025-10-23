import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostmortemState } from "@/types/postmortem";

interface AppendixProps {
  state: PostmortemState;
  onChange: (field: keyof PostmortemState, value: any) => void;
  t: (key: string) => string;
}

export const Appendix = ({ state, onChange, t }: AppendixProps) => {
  return (
    <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-accent rounded-full"></span>
        {t("Appendix")}
      </h2>
      
      <div>
        <Label htmlFor="references">{t("References & Links")}</Label>
        <Textarea
          id="references"
          value={state.references}
          onChange={(e) => onChange('references', e.target.value)}
          placeholder="Dashboards, runbooks, commits, PRs, tickets, architecture diagrams, chat threads."
          className="mt-2 min-h-[150px]"
        />
      </div>
    </Card>
  );
};
