import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { IncidentOverview } from "@/components/IncidentOverview";
import { CauseDetection } from "@/components/CauseDetection";
import { Timeline } from "@/components/Timeline";
import { ActionsTable } from "@/components/ActionsTable";
import { LessonsLearned } from "@/components/LessonsLearned";
import { Appendix } from "@/components/Appendix";
import { Personalization } from "@/components/Personalization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostmortemState } from "@/types/postmortem";
import { useTranslation } from "@/hooks/useTranslation";
import Footer from "@/components/Footer";

import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL ?? "/api/";
const initialState: PostmortemState = {
  title: '',
  creator: '',
  date: '',
  severity: 'SEV-3',
  owners: '',
  duration: '',
  affected: '',
  summary: '',
  impact: '',
  rootCause: '',
  detection: '',
  response: '',
  comm: '',
  timeline: [{ id: '1', time: '', actor: '', notes: '', images: [] }],
  actions: [{ action: '', owner: '', priority: 'P2', due: '', status: 'Open' }],
  lessons: { good: '', improve: '' },
  references: '',
  branding: { logo: '', header: '', footer: '' },
  lang: 'pt',
};

const Index = () => {
  const [state, setState] = useState<PostmortemState>(initialState);
  const { t, lang, setLang } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof PostmortemState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateMarkdown = () => {
    const md = generateMarkdown(state);
    const blob = new Blob([md], { type: 'text/markdown' });
    downloadFile(blob, `${state.title || 'postmortem'}.md`);
    toast.success("Markdown gerado com sucesso!");
  };

  const handleExportJson = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, `${state.title || 'postmortem'}.json`);
    toast.success("JSON exportado com sucesso!");
  };

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setState(data);
      toast.success("JSON importado com sucesso!");
    } catch (error) {
      toast.error("Erro ao importar JSON");
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await fetch(`${API_URL}/generate-postmortem-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      downloadFile(blob, `${state.title || 'postmortem'}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF. Verifique se o backend está rodando.");
    }
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
      setState(initialState);
      toast.success("Campos limpos!");
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdown = (state: PostmortemState): string => {
    const lines: string[] = [];
    lines.push(`# ${state.title || 'Incident Postmortem'}\n`);
    lines.push(`- **Date:** ${state.date || '-'}`);
    lines.push(`- **Severity:** ${state.severity || '-'}`);
    lines.push(`- **Owners:** ${state.owners || '-'}`);
    lines.push(`- **Duration:** ${state.duration || '-'}`);
    lines.push(`- **Affected Systems:** ${state.affected || '-'}\n`);
    lines.push(`## Executive Summary\n${state.summary || ''}\n`);
    lines.push(`## Customer Impact\n${state.impact || ''}\n`);
    lines.push(`## Root Cause\n${state.rootCause || ''}\n`);
    lines.push(`## Detection\n${state.detection || ''}\n`);
    lines.push(`## Incident Response\n${state.response || ''}\n`);
    lines.push(`## Communications\n${state.comm || ''}\n`);
    lines.push(`## Timeline\n`);
    if (state.timeline.length === 0) {
      lines.push('_No timeline entries._\n');
    } else {
      lines.push('| Time | Actor | Notes |');
      lines.push('|---|---|---|');
      state.timeline.forEach(e => {
        lines.push(`| ${e.time || ''} | ${e.actor || ''} | ${e.notes || ''} |`);
      });
      lines.push('');
    }
    lines.push(`## Corrective & Preventive Actions\n`);
    if (state.actions.length === 0) {
      lines.push('_No actions recorded._\n');
    } else {
      lines.push('| Action | Owner | Priority | Due | Status |');
      lines.push('|---|---|---|---|---|');
      state.actions.forEach(a => {
        lines.push(`| ${a.action || ''} | ${a.owner || ''} | ${a.priority || ''} | ${a.due || ''} | ${a.status || ''} |`);
      });
      lines.push('');
    }
    lines.push(`## Lessons Learned\n`);
    lines.push(`**What went well**\n${state.lessons.good || ''}\n`);
    lines.push(`**What to improve**\n${state.lessons.improve || ''}\n`);
    lines.push(`## References\n${state.references || ''}\n`);
    return lines.join('\n');
  };

  return (
    <div className="min-h-screen bg-gradient-radial">
      <Header
        onGenerateMd={handleGenerateMarkdown}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onExportPdf={handleExportPdf}
        onClear={handleClear}
        lang={lang}
        onLangChange={setLang}
        t={t}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="postmortem" className="space-y-6">
          <TabsList className="bg-card/50 border border-border p-1">
            <TabsTrigger value="postmortem" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Postmortem
            </TabsTrigger>
            <TabsTrigger value="personalization" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t("Personalização")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="postmortem" className="space-y-6">
            <IncidentOverview state={state} onChange={handleFieldChange} t={t} />
            <CauseDetection state={state} onChange={handleFieldChange} t={t} />
            <Timeline entries={state.timeline} onChange={(entries) => handleFieldChange('timeline', entries)} t={t} />
            <ActionsTable actions={state.actions} onChange={(actions) => handleFieldChange('actions', actions)} t={t} />
            <LessonsLearned state={state} onChange={handleFieldChange} t={t} />
            <Appendix state={state} onChange={handleFieldChange} t={t} />
          </TabsContent>

          <TabsContent value="personalization">
            <Personalization branding={state.branding} onChange={(branding) => handleFieldChange('branding', branding)} t={t} />
          </TabsContent>
        </Tabs>
        
      </main>
      <Footer />

    </div>
  );
};

export default Index;
