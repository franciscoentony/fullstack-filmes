/**
 * MIDDLEWARE DE PROTEÇÃO DE ROTAS (BACKEND)
 *
 * Este arquivo funciona como um "segurança" que verifica se o usuário
 * tem permissão para acessar determinadas rotas.
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET; // Chave secreta puxada do .env para validar os tokens

export const authMiddleware = (req, res, next) => {
  // 1. Pegar o cabeçalho "Authorization" da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ mensagem: "Acesso negado. Token não fornecido." });
  }

  // 2. O token geralmente vem no formato "Bearer <TOKEN>", então dividimos a string
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ mensagem: "Erro no token enviado." });
  }

  const [scheme, token] = parts;

  // 3. Verifica se o esquema é realmente "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ mensagem: "Token malformatado." });
  }

  // 4. Tenta verificar/abrir o token com a nossa chave secreta
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ mensagem: "Token inválido ou expirado." });

    // 5. Se o token for válido, injetamos o ID e a permissão do usuário dentro da "req" (requisição)
    // Assim, os controllers que virão depois saberão quem é esse usuário.
    req.usuarioId = decoded.id;
    req.isSuperUser = decoded.isSuperUser;

    // 6. "next()" diz para o servidor: "Tudo ok, pode seguir para a próxima função!"
    return next();
  });
};
