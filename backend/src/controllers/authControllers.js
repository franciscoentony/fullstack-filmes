/**
 * CONTROLLER DE AUTENTICAÇÃO
 *
 * Responsável por gerenciar o ciclo de vida dos usuários:
 * - Registro (Nascimento da conta)
 * - Login (Acesso e geração de Token)
 * - Perfil (Visualização e Edição)
 */

import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET; // Chave secreta puxada do .env para assinar os tokens

/**
 * Função para criar um novo usuário no sistema.
 */
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // 1. Validar se o email já existe para evitar duplicidade
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res
        .status(400)
        .json({ mensagem: "Este email já está cadastrado." });
    }

    // 2. Criar o novo usuário (a senha será criptografada automaticamente pelo Model)
    const novoUsuario = await User.create({
      nome,
      email,
      senha,
      // Lógica especial: Se o nome for "Entony", ele nasce como SuperUser (Admin)
      isSuperUser: nome.toLowerCase() === "entony",
    });

    // 3. Gerar um Token JWT para que o usuário já entre logado após o registro
    const token = jwt.sign(
      { id: novoUsuario._id, isSuperUser: novoUsuario.isSuperUser },
      SECRET_KEY,
      { expiresIn: "7d" }, // Expira em 7 dias
    );

    res.status(201).json({
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        avatar: novoUsuario.avatar,
        isSuperUser: novoUsuario.isSuperUser,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao registrar usuário.", detalhe: error.message });
  }
};

/**
 * Função de Login: valida credenciais e entrega o Token.
 */
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Tentar encontrar o usuário pelo email
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    // Check if Entony should be promoted to SuperUser if not already
    if (usuario.nome.toLowerCase() === "entony" && !usuario.isSuperUser) {
      usuario.isSuperUser = true;
      await usuario.save();
    }

    // 2. Verificar se a senha digitada bate com a do banco (usando bcrypt no Model)
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    // 3. Sucesso! Gerar Token com as informações de ID e Permissão
    const token = jwt.sign(
      { id: usuario._id, isSuperUser: usuario.isSuperUser },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    res.json({
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
        isSuperUser: usuario.isSuperUser,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao fazer login.", detalhe: error.message });
  }
};

/**
 * Exclusão de conta (Auto-exclusão ou exclusão por Admin)
 */
export const excluirConta = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitanteId = req.usuarioId; // ID de quem está tentando excluir (vem do Token)
    const isSuperUser = req.isSuperUser; // Nível de permissão de quem está tentando excluir

    // Lógica de proteção: se passar um ID e for Admin, ele deleta o ID passado.
    // Se não for Admin, ele só deleta a própria conta (solicitanteId).
    const usuarioIdParaExcluir = id && isSuperUser ? id : solicitanteId;

    // 1. Limpeza: Remover tudo que pertence a esse usuário no banco
    // await Avaliacao.deleteMany({ usuario: usuarioIdParaExcluir }); // Opcional: remover avaliações
    // await Filme.deleteMany({ usuario: usuarioIdParaExcluir });    // Opcional: remover filmes

    // 2. Deletar o registro do usuário
    const usuarioDeletado = await User.findByIdAndDelete(usuarioIdParaExcluir);

    if (!usuarioDeletado) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.status(200).json({ mensagem: "Conta excluída com sucesso." });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir conta." });
  }
};

/**
 * Atualiza o perfil (Nome e Foto)
 */
export const atualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { nome } = req.body;
    const dadosNovos = { nome };

    // Se houver um arquivo enviado (upload via Multer), salvamos o nome do arquivo
    if (req.file) {
      dadosNovos.avatar = req.file.filename;
    }

    const usuarioAtualizado = await User.findByIdAndUpdate(
      usuarioId,
      dadosNovos,
      {
        new: true, // Retorna o objeto já atualizado
      },
    ).select("-senha"); // Importante: Remover a senha do retorno por segurança

    if (!usuarioAtualizado) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.status(200).json(usuarioAtualizado);
  } catch (error) {
    res.status(400).json({
      mensagem: "Erro ao atualizar perfil.",
      detalhe: error.message,
    });
  }
};

/**
 * Busca usuários (para a página de Explorar)
 */
export const buscarUsuarios = async (req, res) => {
  try {
    const { nome } = req.query;
    const filtro = nome ? { nome: { $regex: nome, $options: "i" } } : {};

    const usuarios = await User.find(filtro).select(
      "nome avatar email isSuperUser",
    );
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar usuários." });
  }
};

/**
 * Retorna dados públicos de um perfil específico
 */
export const obterPerfilPublico = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findById(id).select(
      "nome avatar createdAt isSuperUser",
    );

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(400).json({ mensagem: "ID de usuário inválido." });
  }
};
