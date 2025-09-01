import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string | File;
  onChange: (fileOrUrl: File | string) => void;
  label?: string;
}

export const ImageUpload = ({ value, onChange, label = "Imagem" }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Atualiza preview quando value muda
  useEffect(() => {
    if (typeof value === 'string') {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      setPreviewUrl(URL.createObjectURL(value));
    } else {
      setPreviewUrl('');
    }
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    onChange(file); // envia o File para o form

    // Limpa input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewUrl(url);
  };

  const clearImage = () => {
    onChange(''); // limpa o form
    setPreviewUrl(''); // limpa preview
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Preview */}
      {previewUrl && (
        <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden border border-border">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl('')}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = ''; // limpa antes de abrir
              fileInputRef.current.click();
            }
          }}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload
        </Button>

        {!previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ImageIcon className="w-4 h-4" /> ou insira uma URL
          </Button>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Input de URL */}
      <Input
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg ou faça upload"
        className="text-sm"
      />
    </div>
  );
};
