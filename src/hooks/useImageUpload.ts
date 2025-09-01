import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Simulação de upload para ambiente local (sem Supabase configurado)
const simulateImageUpload = async (file: File): Promise<string> => {
  // Criar URL local temporária para demonstração
  return URL.createObjectURL(file);
};

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem válida (JPEG, PNG, SVG, WebP ou GIF)",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive",
        });
        return null;
      }

      // Para demonstração, vamos simular o upload
      // Em produção, aqui seria o upload real para Supabase Storage
      const uploadedUrl = await simulateImageUpload(file);

      toast({
        title: "Upload realizado",
        description: "Imagem carregada com sucesso (simulação local)",
      });

      return uploadedUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};