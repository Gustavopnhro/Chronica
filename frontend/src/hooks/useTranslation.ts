import { useState, useCallback } from 'react';

// @ts-ignore
const locales = {
  pt: {
    "Gerar Markdown": "Gerar Markdown",
    "Exportar JSON": "Exportar JSON",
    "Importar JSON": "Importar JSON",
    "Exportar PDF": "Exportar PDF",
    "Limpar": "Limpar",
    "Incident Overview": "Visão Geral do Incidente",
    "Incident Title": "Título do Incidente",
    "Creator": "Criador",
    "Date (start)": "Data (início)",
    "Severity": "Gravidade",
    "Incident Commander / Owners": "Comandante do Incidente / Donos",
    "Duration": "Duração",
    "Affected Systems": "Sistemas Afetados",
    "Executive Summary": "Sumário Executivo",
    "Customer Impact": "Impacto no Cliente",
    "Cause & Detection": "Causa e Detecção",
    "Root Cause": "Causa Raiz",
    "Detection": "Detecção",
    "Incident Response": "Resposta ao Incidente",
    "Communications": "Comunicações",
    "Timeline": "Linha do Tempo",
    "Add Entry": "Adicionar Entrada",
    "Corrective & Preventive Actions (CAPA)": "Ações Corretivas e Preventivas (CAPA)",
    "Action": "Ação",
    "Owner": "Dono",
    "Priority": "Prioridade",
    "Due": "Prazo",
    "Status": "Status",
    "Add Action": "Adicionar Ação",
    "Lessons Learned": "Lições Aprendidas",
    "What went well": "O que foi bem",
    "What to improve": "O que melhorar",
    "Appendix": "Apêndice",
    "References & Links": "Referências e Links",
    "Personalização": "Personalização",
    "Logo (capa)": "Logo (capa)",
    "Remover logo": "Remover logo",
  },
  en: {
    "Gerar Markdown": "Generate Markdown",
    "Exportar JSON": "Export JSON",
    "Importar JSON": "Import JSON",
    "Exportar PDF": "Export PDF",
    "Limpar": "Clear",
    "Incident Overview": "Incident Overview",
    "Incident Title": "Incident Title",
    "Creator": "Creator",
    "Date (start)": "Date (start)",
    "Severity": "Severity",
    "Incident Commander / Owners": "Incident Commander / Owners",
    "Duration": "Duration",
    "Affected Systems": "Affected Systems",
    "Executive Summary": "Executive Summary",
    "Customer Impact": "Customer Impact",
    "Cause & Detection": "Cause & Detection",
    "Root Cause": "Root Cause",
    "Detection": "Detection",
    "Incident Response": "Incident Response",
    "Communications": "Communications",
    "Timeline": "Timeline",
    "Add Entry": "Add Entry",
    "Corrective & Preventive Actions (CAPA)": "Corrective & Preventive Actions (CAPA)",
    "Action": "Action",
    "Owner": "Owner",
    "Priority": "Priority",
    "Due": "Due",
    "Status": "Status",
    "Add Action": "Add Action",
    "Lessons Learned": "Lessons Learned",
    "What went well": "What went well",
    "What to improve": "What to improve",
    "Appendix": "Appendix",
    "References & Links": "References & Links",
    "Personalização": "Customization",
    "Logo (capa)": "Logo (cover)",
    "Remover logo": "Remove logo",
  },
};

export const useTranslation = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');

  const t = useCallback(
    (key: string): string => {
      return locales[lang]?.[key] || key;
    },
    [lang]
  );

  return { t, lang, setLang };
};
