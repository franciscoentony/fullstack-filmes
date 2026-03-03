import { Router } from "express";
import * as authController from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer.js";

const authRoutes = Router();

authRoutes.post("/register", authController.registrar);
authRoutes.post("/login", authController.login);
authRoutes.put(
  "/perfil",
  authMiddleware,
  upload.single("avatar"),
  authController.atualizarPerfil,
);

authRoutes.get("/usuarios", authController.buscarUsuarios);
authRoutes.get("/usuarios/:id", authController.obterPerfilPublico);
authRoutes.delete("/perfil", authMiddleware, authController.excluirConta);
authRoutes.delete("/perfil/:id", authMiddleware, authController.excluirConta);

export default authRoutes;
