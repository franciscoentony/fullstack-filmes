import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl } from '../api/config';

export default function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.usuario, data.token);
        navigate('/');
      } else {
        const errorMessage = data.mensagem || 'Falha ao cadastrar';
        const errorDetail = data.detalhe ? `\n\nDetalhe técnico: ${data.detalhe}` : '';
        alert(`${errorMessage}${errorDetail}`);
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
      <div className="w-full max-w-[400px] bg-brand-card p-8 rounded-2xl border border-brand-border shadow-2xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-brand-text-secondary text-sm mb-6 hover:text-brand-primary">
          <ArrowLeft size={16} /> Voltar para o login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-brand-text-secondary">Junte-se à nossa comunidade de cinéfilos</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Nome completo</label>
            <Input 
              name="nome"
              icon={User}
              placeholder="Seu nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Email</label>
            <Input 
              type="email"
              name="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Senha</label>
            <Input 
              type="password"
              name="senha"
              icon={Lock}
              placeholder="Mínimo 6 caracteres"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Confirmar Senha</label>
            <Input 
              type="password"
              name="confirmarSenha"
              icon={Lock}
              placeholder="Repita sua senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-base mt-2 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Criar minha conta'}
          </Button>
        </form>
      </div>
    </div>
  );
}
