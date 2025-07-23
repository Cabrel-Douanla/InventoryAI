// Fichier: src/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Brain, LogIn, UserPlus, Building2, Save, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import type { UserProfile, LoginResponse } from '../types';
import api from '../api';
import { loginUser, registerUser, createCompany } from '../services/apiServices';

// ==============================================================================
// SCHÉMAS DE VALIDATION ZOD
// ==============================================================================
const registerSchema = z.object({
    email: z.string().email({ message: "Adresse email invalide." }),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
});
type RegisterFormData = z.infer<typeof registerSchema>;

const loginSchema = z.object({
    email: z.string().email({ message: "Adresse email invalide." }),
    password: z.string().min(1, { message: "Le mot de passe est requis." }),
});
type LoginFormData = z.infer<typeof loginSchema>;

const companySchema = z.object({
    name: z.string().min(2, { message: "Le nom de l'entreprise est requis." }),
});
type CompanyFormData = z.infer<typeof companySchema>;

// ==============================================================================
// SOUS-COMPOSANTS DE FORMULAIRE
// ==============================================================================

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });
    const [showPassword, setShowPassword] = useState(false);
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data: LoginResponse) => {
            toast.success("Connexion réussie !");
            onLoginSuccess(data.user, data.access_token);
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || "Email ou mot de passe incorrect."}`);
        }
    });

    const onSubmit: SubmitHandler<LoginFormData> = (data) => {
        loginMutation.mutate({ username: data.email, password: data.password });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ... (Champs Email, Mot de passe avec icônes) ... */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input {...register('email')} type="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="vous@exemple.com" />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input {...register('password')} type={showPassword ? "text" : "password"} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loginMutation.isPending} className="w-full btn-primary flex justify-center items-center gap-2">
                {loginMutation.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
                {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
            </button>
            <p className="text-center text-sm">Pas encore de compte ? <button type="button" onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:underline">Inscrivez-vous</button></p>
        </form>
    );
};

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });
    const [showPassword, setShowPassword] = useState(false);
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data: UserProfile) => {
            toast.success("Inscription réussie ! Veuillez vous connecter.");
            onRegisterSuccess();
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || "Impossible de s'inscrire."}`);
        }
    });

    const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
        registerMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ... (Champs Email, Mot de passe avec icônes) ... */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input {...register('email')} type="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="vous@exemple.com" />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input {...register('password')} type={showPassword ? "text" : "password"} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Minimum 8 caractères" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={registerMutation.isPending} className="w-full btn-primary flex justify-center items-center gap-2">
                {registerMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                {registerMutation.isPending ? 'Inscription...' : "Créer mon compte"}
            </button>
            <p className="text-center text-sm">Déjà un compte ? <button type="button" onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:underline">Connectez-vous</button></p>
        </form>
    );
};

const CompanyOnboardingForm = ({ onCompanyCreated }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema)
    });

    const createCompanyMutation = useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            toast.success("Entreprise créée ! Redirection vers votre tableau de bord.");
            onCompanyCreated();
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || "Impossible de créer l'entreprise."}`);
        }
    });

    const onSubmit: SubmitHandler<CompanyFormData> = (data) => {
        createCompanyMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Créez votre première entreprise</h2>
            <p className="text-gray-600">Vous avez besoin d'au moins une entreprise pour commencer à utiliser InventoryAI.</p>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input {...register('name')} type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ex: Ma Super Entreprise SARL" />
                </div>
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <button type="submit" disabled={createCompanyMutation.isPending} className="w-full btn-primary flex justify-center items-center gap-2">
                {createCompanyMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                {createCompanyMutation.isPending ? 'Création...' : 'Créer et continuer'}
            </button>
        </form>
    );
};

// ==============================================================================
// COMPOSANT PRINCIPAL DE LA PAGE
// ==============================================================================
type AuthStep = 'login' | 'register' | 'onboarding';

const AuthPage = () => {
    const [step, setStep] = useState<AuthStep>('login');
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleLoginSuccess = (user: UserProfile, token: string) => {
        login(user, token);
        if (user.companies && user.companies.length > 0) {
            navigate('/dashboard');
        } else {
            setStep('onboarding');
        }
    };

    const handleCompanyCreated = async () => {
        // Rafraîchir les données utilisateur pour obtenir la nouvelle entreprise dans le store
        try {
            const response = await api.get('/api/v1/users/me');
            const token = localStorage.getItem('inventoryai_token');
            if (response.data && token) {
                login(response.data, token);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Erreur de rafraîchissement après création d'entreprise", error);
            toast.error("Erreur de synchronisation, veuillez vous reconnecter.");
        }
    };

    const titles = {
        login: "Connectez-vous à votre compte",
        register: "Créez votre compte InventoryAI",
        onboarding: "Bienvenue ! Une dernière étape...",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">InventoryAI</h1>
                    <p className="text-gray-600 mt-2">{titles[step]}</p>
                </div>

                {step === 'login' && <LoginForm onSwitchToRegister={() => setStep('register')} onLoginSuccess={handleLoginSuccess} />}
                {step === 'register' && <RegisterForm onSwitchToLogin={() => setStep('login')} onRegisterSuccess={() => setStep('login')} />}
                {step === 'onboarding' && <CompanyOnboardingForm onCompanyCreated={handleCompanyCreated} />}

            </div>
        </div>
    );
};

export default AuthPage;