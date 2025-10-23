import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostmortemState } from "@/types/postmortem";

interface LessonsLearnedProps {
  state: PostmortemState;
  onChange: (field: 'lessons', value: any) => void;
  t: (key: string) => string;
}

export const LessonsLearned = ({ state, onChange, t }: LessonsLearnedProps) => {
  const handleUpdate = (field: 'good' | 'improve', value: string) => {
    onChange('lessons', { ...state.lessons, [field]: value });
  };

  return (
    <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        {t("Lessons Learned")}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="whatWentWell">{t("What went well")}</Label>
          <Textarea
            id="whatWentWell"
            value={state.lessons.good}
            onChange={(e) => handleUpdate('good', e.target.value)}
            placeholder="Practices/tools/behaviors we should repeat."
            className="mt-2 min-h-[150px]"
          />
        </div>
        
        <div>
          <Label htmlFor="whatToImprove">{t("What to improve")}</Label>
          <Textarea
            id="whatToImprove"
            value={state.lessons.improve}
            onChange={(e) => handleUpdate('improve', e.target.value)}
            placeholder="Gaps in monitoring, testing, processes, on-call, runbooks, comms."
            className="mt-2 min-h-[150px]"
          />
        </div>
      </div>
    </Card>
  );
};
