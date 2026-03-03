import { Filme } from "../models/Filme.js";

export const listarFilmes = async (req, res) => {
  try {
    const { usuarioId } = req.query;
    // Por padrão, só lista filmes aprovados (ou antigos que não têm status ainda)
    const filtro = usuarioId
      ? { usuario: usuarioId }
      : { $or: [{ status: "aprovado" }, { status: { $exists: false } }] };

    const filmes = await Filme.find(filtro).populate(
      "usuario",
      "nome avatar isSuperUser",
    );
    res.status(200).json(filmes);
  } catch (error) {
    res.status(401).json({ mensagem: "Não encontrado" });
  }
};

export const exibirFilme = async (req, res) => {
  try {
    const { id } = req.params;
    const filme = await Filme.findById(id).populate(
      "usuario",
      "nome avatar isSuperUser",
    );
    if (!filme) {
      return res.status(404).json({ mensagem: "Filme não encontrado" });
    }
    res.status(200).json(filme);
  } catch (error) {
    res.status(400).json({ mensagem: "ID inválido ou erro na busca" });
  }
};

export const criarFilme = async (req, res) => {
  try {
    const { nome, ano, genero, descricao } = req.body;
    const usuarioId = req.usuarioId; // Vem do authMiddleware

    const dadosFilme = {
      nome,
      ano: Number(ano),
      genero,
      descricao,
      capa: req.file ? req.file.filename : null,
      usuario: usuarioId,
      status: "pendente", // Garantindo que começa como pendente
    };

    const filmeCriado = await Filme.create(dadosFilme);
    res.json(filmeCriado);
  } catch (error) {
    console.error("Erro ao criar filme:", error);
    res.status(400).json({
      mensagem: "Erro ao criar filme",
      detalhe: error.message,
    });
  }
};

export const editarFilme = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuarioId;
    const isSuperUser = req.isSuperUser;

    const filme = await Filme.findById(id);
    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado." });
    }

    // Validar dono ou SuperUser
    if (filme.usuario.toString() !== usuarioId && !isSuperUser) {
      return res.status(403).json({
        mensagem:
          "Acesso negado. Você não tem permissão para editar este filme.",
      });
    }

    const { nome, ano, genero, descricao } = req.body;
    const dadosNovos = {
      nome,
      ano: Number(ano),
      genero,
      descricao,
    };

    // Se não for superuser editando, volta para pendente ao editar?
    // Vamos deixar como pendente se houver alteração crítica, ou sempre?
    // Para simplificar e garantir segurança, se o usuário comum editar, volta para pendente.
    if (!isSuperUser) {
      dadosNovos.status = "pendente";
    }

    if (req.file) {
      dadosNovos.capa = req.file.filename;
    }

    const filmeAtualizado = await Filme.findByIdAndUpdate(id, dadosNovos, {
      new: true,
    });

    res.status(200).json(filmeAtualizado);
  } catch (error) {
    console.error("Erro ao editar filme:", error);
    res.status(400).json({
      mensagem: "Erro na atualização.",
      detalhe: error.message,
    });
  }
};

export const excluirFilme = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuarioId;
    const isSuperUser = req.isSuperUser;

    const filme = await Filme.findById(id);
    if (!filme) {
      return res.status(404).json({ mensagem: "Filme não encontrado" });
    }

    // Validar dono ou SuperUser
    if (filme.usuario.toString() !== usuarioId && !isSuperUser) {
      return res.status(403).json({
        mensagem:
          "Acesso negado. Você não tem permissão para excluir este filme.",
      });
    }

    await Filme.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      mensagem: "Erro ao excluir.",
      detalhe: error.message,
    });
  }
};

// --- NOVAS FUNÇÕES DE MODERAÇÃO ---

export const listarPendencias = async (req, res) => {
  try {
    if (!req.isSuperUser) {
      return res
        .status(403)
        .json({ mensagem: "Acesso restrito a administradores." });
    }

    const pendentes = await Filme.find({ status: "pendente" }).populate(
      "usuario",
      "nome email",
    );
    res.status(200).json(pendentes);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar pendências." });
  }
};

export const moderarFilme = async (req, res) => {
  try {
    if (!req.isSuperUser) {
      return res
        .status(403)
        .json({ mensagem: "Acesso restrito a administradores." });
    }

    const { id } = req.params;
    const { status } = req.body; // 'aprovado' ou 'rejeitado'

    if (!["aprovado", "rejeitado"].includes(status)) {
      return res.status(400).json({ mensagem: "Status inválido." });
    }

    const filme = await Filme.findByIdAndUpdate(id, { status }, { new: true });
    if (!filme) {
      return res.status(404).json({ mensagem: "Filme não encontrado." });
    }

    res.status(200).json({ mensagem: `Filme ${status} com sucesso!`, filme });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao moderar filme." });
  }
};
