/**
 * CONFIGURAÇÃO CENTRALIZADA DA API (FRONTEND)
 *
 * Este arquivo é fundamental para o deploy. Ele define para onde o frontend
 * deve enviar as requisições (qual é a URL do nosso backend).
 */

// Se estivermos em produção, pegamos a URL do .env. Se estivermos locais, usa localhost:4000.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Função utilitária para montar URLs de endpoints da API de forma limpa.
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Função utilitária para montar URLs de arquivos de imagem (Uploads).
 */
export const getUploadUrl = (filename) => {
  if (!filename) return null;
  // Se já for uma URL externa completa, não faz nada
  if (filename.startsWith("http")) return filename;
  // Se for apenas o nome do arquivo, aponta para a pasta de uploads do backend
  return `${API_BASE_URL}/uploads/${filename}`;
};
