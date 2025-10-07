import React, { useState } from 'react';
import { NavGurukulLogo } from './icons';
import { login, signUp } from '../services/authService';

interface AuthProps {
    onLoginSuccess: (user: { email: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (pass: string) => {
        const errors = [];
        if (pass.length < 8) errors.push("at least 8 characters");
        if (!/\d/.test(pass)) errors.push("a number");
        if (!/[a-zA-Z]/.test(pass)) errors.push("a letter");
        return errors;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!isLoginView) {
            const passwordErrors = validatePassword(password);
            if (passwordErrors.length > 0) {
                setError(`Password must contain ${passwordErrors.join(', ')}.`);
                return;
            }
        }
        
        setIsLoading(true);

        try {
            if (isLoginView) {
                const result = await login(email, password);
                if (result.success && result.user) {
                    onLoginSuccess(result.user);
                } else {
                    setError(result.message);
                }
            } else {
                const result = await signUp(email, password);
                if (result.success) {
                    setSuccessMessage(result.message);
                    setIsLoginView(true); // Switch to login view after successful signup
                    setPassword('');
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const passwordErrors = isLoginView ? [] : validatePassword(password);

    return (
        <div className="flex items-center justify-center min-h-screen bg-orange-50/50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200/80">
                <div className="flex flex-col items-center">
                    <NavGurukulLogo />
                    <h2 className="mt-6 text-2xl font-bold text-center text-gray-900">
                        {isLoginView ? 'Welcome Back!' : 'Create an Account'}
                    </h2>
                    <p className="mt-2 text-sm text-center text-gray-600">
                        {isLoginView ? 'Sign in to access your AI Assistant' : 'Get started by creating a new account'}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLoginView ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        {!isLoginView && password.length > 0 && passwordErrors.length > 0 && (
                            <div className="text-xs text-red-600 pl-1">
                                Password must contain: {passwordErrors.join(', ')}.
                            </div>
                        )}
                    </div>
                    
                    {error && <p className="text-sm text-center text-red-600">{error}</p>}
                    {successMessage && <p className="text-sm text-center text-green-600">{successMessage}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md group hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : (isLoginView ? 'Sign in' : 'Create Account')}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setError('');
                                setSuccessMessage('');
                                setPassword('');
                            }}
                            className="font-medium text-orange-600 hover:text-orange-500"
                        >
                            {isLoginView ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;