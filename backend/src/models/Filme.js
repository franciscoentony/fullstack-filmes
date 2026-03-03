import mongoose from "mongoose";

const filmesSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true },
    ano: { type: Number, required: true },
    genero: { type: String, required: true },
    descricao: { type: String },
    capa: { type: String },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, default: 0 },
    numAvaliacoes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pendente", "aprovado", "rejeitado"],
      default: "pendente",
    },
  },
  { timestamps: true },
);

export const Filme = mongoose.model("Filme", filmesSchema);
