/**
 * ARQUIVO PRINCIPAL DO SERVIDOR (BACKEND)
 *
 * Este arquivo é o ponto de entrada da nossa API. Ele é responsável por:
 * 1. Carregar variáveis de ambiente (segurança).
 * 2. Conectar ao banco de dados MongoDB.
 * 3. Iniciar o servidor Express.
 */

import dotenv from "dotenv";
dotenv.config(); // Carrega as configurações do arquivo .env para o process.env

import app from "./src/app.js"; // Importa as rotas e middlewares configurados no app.js
const PORT = process.env.PORT || 4000; // Define a porta do servidor (usa a do .env ou 4000 como padrão)
import mongoose from "mongoose";

// Conexão com o MongoDB Atlas usando a URI guardada no .env
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado ao Banco de Dados com sucesso!"))
  .catch((err) => console.log("❌ Erro ao conectar ao Banco de Dados:", err));

// Inicia o servidor para ouvir requisições na porta definida
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
