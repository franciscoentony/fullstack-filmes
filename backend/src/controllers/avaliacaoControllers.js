import { Avaliacao } from "../models/Avaliacao.js";
import { Filme } from "../models/Filme.js";

export const avaliarFilme = async (req, res) => {
  try {
    const { filmeId, nota, comentario } = req.body;
    const usuarioId = req.usuarioId;

    if (!nota || nota < 1 || nota > 5) {
      return res
        .status(400)
        .json({ mensagem: "Nota inválida. Deve ser entre 1 e 5." });
    }

    // Upsert da avaliação com o comentário
    await Avaliacao.findOneAndUpdate(
      { filme: filmeId, usuario: usuarioId },
      { nota, comentario },
      { upsert: true, new: true },
    );

    // Calcular a nova média para o filme
    const avaliacoes = await Avaliacao.find({ filme: filmeId });
    const numAvaliacoes = avaliacoes.length;
    const somaNotas = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
    const media = somaNotas / numAvaliacoes;

    // Atualizar o filme
    await Filme.findByIdAndUpdate(filmeId, {
      rating: media,
      numAvaliacoes: numAvaliacoes,
    });

    res.status(200).json({
      mensagem: "Avaliação salva com sucesso!",
      rating: media,
      numAvaliacoes,
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao avaliar filme.",
      detalhe: error.message,
    });
  }
};

export const obterAvaliacaoUsuario = async (req, res) => {
  try {
    const { filmeId } = req.params;
    const usuarioId = req.usuarioId;

    const avaliacao = await Avaliacao.findOne({
      filme: filmeId,
      usuario: usuarioId,
    });
    res
      .status(200)
      .json(
        avaliacao
          ? { nota: avaliacao.nota, comentario: avaliacao.comentario }
          : { nota: 0, comentario: "" },
      );
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar avaliação." });
  }
};

export const listarAvaliacoesFilme = async (req, res) => {
  try {
    const { filmeId } = req.params;
    const avaliacoes = await Avaliacao.find({ filme: filmeId })
      .populate("usuario", "nome avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar avaliações." });
  }
};

export const excluirAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuarioId;

    const avaliacao = await Avaliacao.findById(id);
    if (!avaliacao) {
      return res.status(404).json({ mensagem: "Avaliação não encontrada." });
    }

    // Apenas o dono da avaliação ou um admin pode excluir
    console.log("Debug Excluir:", {
      reviewOwner: avaliacao.usuario.toString(),
      requesterId: usuarioId,
      isSuperUser: req.isSuperUser,
    });

    if (avaliacao.usuario.toString() !== usuarioId && !req.isSuperUser) {
      return res.status(403).json({ mensagem: "Não autorizado." });
    }

    const filmeId = avaliacao.filme;
    await Avaliacao.findByIdAndDelete(id);

    // Recalcular a média para o filme
    const avaliacoesRestantes = await Avaliacao.find({ filme: filmeId });
    const numAvaliacoes = avaliacoesRestantes.length;
    const somaNotas = avaliacoesRestantes.reduce(
      (acc, curr) => acc + curr.nota,
      0,
    );
    const media = numAvaliacoes > 0 ? somaNotas / numAvaliacoes : 0;

    await Filme.findByIdAndUpdate(filmeId, {
      rating: media,
      numAvaliacoes: numAvaliacoes,
    });

    res.status(200).json({
      mensagem: "Avaliação excluída com sucesso!",
      rating: media,
      numAvaliacoes,
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir avaliação." });
  }
};
