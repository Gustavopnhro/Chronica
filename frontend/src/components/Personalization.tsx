import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Upload } from "lucide-react";
import { Branding } from "@/types/postmortem";
import { useRef } from "react";

interface PersonalizationProps {
  branding: Branding;
  onChange: (branding: Branding) => void;
  t: (key: string) => string;
}

export const Personalization = ({ branding, onChange, t }: PersonalizationProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (type: 'logo' | 'header' | 'footer', file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange({ ...branding, [type]: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = (type: 'logo' | 'header' | 'footer') => {
    onChange({ ...branding, [type]: '' });
    if (type === 'logo' && logoInputRef.current) logoInputRef.current.value = '';
    if (type === 'header' && headerInputRef.current) headerInputRef.current.value = '';
    if (type === 'footer' && footerInputRef.current) footerInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">{t("Logo (capa)")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Será exibida somente na capa, centralizada, junto do título.
        </p>
        
        <div className="space-y-4">
          <Input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
          
          {branding.logo && (
            <div className="relative inline-block">
              <img src={branding.logo} alt="Logo preview" className="max-h-32 rounded-lg border border-border" />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleClear('logo')}
                className="absolute -top-2 -right-2 h-6 w-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {branding.logo && (
            <Button variant="ghost" onClick={() => handleClear('logo')} className="gap-2">
              <Trash2 className="w-4 h-4" />
              {t("Remover logo")}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Header (páginas internas)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use uma faixa horizontal. A imagem é ajustada à largura útil da página no PDF.
        </p>
        
        <div className="space-y-4">
          <Input
            ref={headerInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('header', e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
          
          {branding.header && (
            <div className="relative inline-block">
              <img src={branding.header} alt="Header preview" className="max-h-24 rounded-lg border border-border" />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleClear('header')}
                className="absolute -top-2 -right-2 h-6 w-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 border-card-border bg-card/50 backdrop-blur-sm shadow-xl animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Footer (páginas internas)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Será posicionado acima da margem inferior. Imagem também ajustada à largura útil.
        </p>
        
        <div className="space-y-4">
          <Input
            ref={footerInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('footer', e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
          
          {branding.footer && (
            <div className="relative inline-block">
              <img src={branding.footer} alt="Footer preview" className="max-h-24 rounded-lg border border-border" />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleClear('footer')}
                className="absolute -top-2 -right-2 h-6 w-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
