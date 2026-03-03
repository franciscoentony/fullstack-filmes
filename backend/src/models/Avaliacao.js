import mongoose from "mongoose";

const avaliacaoSchema = new mongoose.Schema(
  {
    filme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filme",
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nota: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String },
  },
  { timestamps: true },
);

// Garantir que um usuário só pode avaliar um filme uma vez
avaliacaoSchema.index({ filme: 1, usuario: 1 }, { unique: true });

export const Avaliacao = mongoose.model("Avaliacao", avaliacaoSchema);
