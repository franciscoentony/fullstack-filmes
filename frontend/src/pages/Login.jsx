import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl } from '../api/config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.usuario, data.token);
        navigate('/');
      } else {
        const errorMessage = data.mensagem || 'Falha ao fazer login';
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
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo</h1>
          <p className="text-brand-text-secondary">Faça login para gerenciar seus filmes</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Email</label>
            <Input 
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Senha</label>
            <Input 
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-base cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar'}
          </Button>
        </form>

        <p className="text-center mt-8 text-brand-text-secondary text-sm">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="text-brand-primary font-bold hover:underline inline-flex items-center gap-1">
            Cadastre-se <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </div>
  );
}
