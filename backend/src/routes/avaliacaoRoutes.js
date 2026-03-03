import { Router } from "express";
import * as avaliacaoController from "../controllers/avaliacaoControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const avaliacaoRoutes = Router();

avaliacaoRoutes.post("/", authMiddleware, avaliacaoController.avaliarFilme);
avaliacaoRoutes.get(
  "/usuario/:filmeId",
  authMiddleware,
  avaliacaoController.obterAvaliacaoUsuario,
);
avaliacaoRoutes.get(
  "/filme/:filmeId",
  avaliacaoController.listarAvaliacoesFilme,
);
avaliacaoRoutes.delete(
  "/:id",
  authMiddleware,
  avaliacaoController.excluirAvaliacao,
);

export default avaliacaoRoutes;
