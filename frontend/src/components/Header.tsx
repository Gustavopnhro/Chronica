import { Button } from "@/components/ui/button";
import { FileText, FileDown, FileUp, FileOutput, Trash2 } from "lucide-react";

interface HeaderProps {
  onGenerateMd: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onExportPdf: () => void;
  onClear: () => void;
  lang: 'pt' | 'en';
  onLangChange: (lang: 'pt' | 'en') => void;
  t: (key: string) => string;
}

export const Header = ({
  onGenerateMd,
  onExportJson,
  onImportJson,
  onExportPdf,
  onClear,
  lang,
  onLangChange,
  t,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-card/80 border-b border-border shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-transparent">
                  <img
                    src="/logo.png"
                    alt="Chronica logo"
                    className="w-full h-full object-contain"
                  />
                </div>
            <h1 className="text-xl font-bold bg-primary rounded-full bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              hronica
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onGenerateMd} variant="secondary" size="sm" className="gap-2">
              <FileDown className="w-4 h-4" />
              {t("Gerar Markdown")}
            </Button>
            <Button onClick={onExportJson} variant="secondary" size="sm" className="gap-2">
              <FileOutput className="w-4 h-4" />
              {t("Exportar JSON")}
            </Button>
            <Button onClick={onImportJson} variant="secondary" size="sm" className="gap-2">
              <FileUp className="w-4 h-4" />
              {t("Importar JSON")}
            </Button>
            <Button onClick={onExportPdf} variant="default" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              {t("Exportar PDF")}
            </Button>
            <Button onClick={onClear} variant="destructive" size="sm" className="gap-2">
              <Trash2 className="w-4 h-4" />
              {t("Limpar")}
            </Button>
            
            <div className="flex items-center gap-1 ml-2 bg-secondary rounded-lg p-1">
              <button
                onClick={() => onLangChange('pt')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  lang === 'pt'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => onLangChange('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  lang === 'en'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
