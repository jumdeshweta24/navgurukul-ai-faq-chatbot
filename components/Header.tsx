import React from 'react';
import { NavGurukulLogo, SignOutIcon } from './icons';

interface HeaderProps {
    onClearHistory: () => void;
    onLogout: () => void;
    currentUserEmail: string;
}

const Header: React.FC<HeaderProps> = ({ onClearHistory, onLogout, currentUserEmail }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-3">
                <NavGurukulLogo />
                <h1 className="text-xl font-bold text-gray-800">NavGurukul AI Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
                 <span className="text-sm text-gray-600 hidden md:inline">
                    Welcome, <span className="font-semibold">{currentUserEmail}</span>
                </span>
                <button
                    onClick={onClearHistory}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Clear chat history"
                >
                    Clear Chat
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Sign out"
                >
                    <SignOutIcon />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;