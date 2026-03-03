import express from "express";
import cors from "cors";
import routes from "./routes/filmesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import avaliacaoRoutes from "./routes/avaliacaoRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express();

app.use(cors());

//app.use(express.json()) // Diz para o Node que vamos usar json

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Torna a pasta 'uploads' acessível publicamente através da rota /uploads
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/avaliacoes", avaliacaoRoutes);
app.use("", routes);

export default app;
