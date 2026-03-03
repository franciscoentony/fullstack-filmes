/**
 * CONTEXTO DE AUTENTICAÇÃO (O "Coração" do Estado Global)
 * 
 * Este arquivo usa a Context API do React para compartilhar os dados do usuário
 * logado com todos os componentes da aplicação, sem precisar passar props manualmente.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Criamos o Contexto
const AuthContext = createContext();

// 2. Criamos o Provedor (Provider) que vai envolver a aplicação inteira
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Estado que guarda o usuário logado
    const [loading, setLoading] = useState(true); // Estado para saber se ainda estamos checando o login

    // useEffect roda assim que o site abre
    useEffect(() => {
        // Verifica se existe um usuário salvo no navegador (localStorage)
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            // Se existir, coloca no estado local para o site saber que estamos logados
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    /**
     * Função para realizar o login: salva no estado e no navegador.
     */
    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    };

    /**
     * Função para sair: limpa tudo.
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    /**
     * Função para atualizar dados do perfil (como nome ou avatar) no estado global.
     */
    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    // 3. Retornamos o Provider passando os dados e funções que queremos que o resto do site acesse
    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook personalizado para facilitar o uso do contexto em outros componentes.
 * Ex: const { user, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
