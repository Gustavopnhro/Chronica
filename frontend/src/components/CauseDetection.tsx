import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostmortemState } from "@/types/postmortem";

interface CauseDetectionProps {
  state: PostmortemState;
  onChange: (field: keyof PostmortemState, value: any) => void;
  t: (key: string) => string;
}

export const CauseDetection = ({ state, onChange, t }: CauseDetectionProps) => {
  return (
    <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-accent rounded-full"></span>
        {t("Cause & Detection")}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="rootCause">{t("Root Cause")}</Label>
          <Textarea
            id="rootCause"
            value={state.rootCause}
            onChange={(e) => onChange('rootCause', e.target.value)}
            placeholder="Direct cause and deeper contributing factors; include architecture component names/IDs."
            className="mt-2 min-h-[120px]"
          />
        </div>
        
        <div>
          <Label htmlFor="detection">{t("Detection")}</Label>
          <Textarea
            id="detection"
            value={state.detection}
            onChange={(e) => onChange('detection', e.target.value)}
            placeholder="How was it detected? (monitor/alert, user report). Time from start to detect."
            className="mt-2 min-h-[120px]"
          />
        </div>
        
        <div>
          <Label htmlFor="response">{t("Incident Response")}</Label>
          <Textarea
            id="response"
            value={state.response}
            onChange={(e) => onChange('response', e.target.value)}
            placeholder="Key actions taken to mitigate and resolve; what worked, what didn't."
            className="mt-2 min-h-[120px]"
          />
        </div>
        
        <div>
          <Label htmlFor="comm">{t("Communications")}</Label>
          <Textarea
            id="comm"
            value={state.comm}
            onChange={(e) => onChange('comm', e.target.value)}
            placeholder="Internal/external comms: status page, customer notices, leadership updates."
            className="mt-2 min-h-[120px]"
          />
        </div>
      </div>
    </Card>
  );
};
