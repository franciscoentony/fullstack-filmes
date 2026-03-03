import { Router } from "express";
const filmesRoutes = Router();
import * as filmesController from "../controllers/filmesControllers.js";
import { upload } from "../config/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

filmesRoutes.get("/filmes", filmesController.listarFilmes);
filmesRoutes.get("/filmes/:id", filmesController.exibirFilme);

// Rotas protegidas
filmesRoutes.post(
  "/filmes",
  authMiddleware,
  upload.single("capa"),
  filmesController.criarFilme,
);
filmesRoutes.put(
  "/filmes/:id",
  authMiddleware,
  upload.single("capa"),
  filmesController.editarFilme,
);
filmesRoutes.delete(
  "/filmes/:id",
  authMiddleware,
  filmesController.excluirFilme,
);

// Rotas de Moderação (Admin apenas)
filmesRoutes.get(
  "/moderacao/pendentes",
  authMiddleware,
  filmesController.listarPendencias,
);
filmesRoutes.patch(
  "/moderacao/:id",
  authMiddleware,
  filmesController.moderarFilme,
);

// 'capa' é o nome do campo que você vai usar no Postman/Front-end
filmesRoutes.post("/", upload.single("capa"), filmesController.criarFilme);

export default filmesRoutes;
