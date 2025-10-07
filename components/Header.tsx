import React from 'react';
import { NavGurukulLogo } from './icons';

interface HeaderProps {
    onClearHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearHistory }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-3">
                <NavGurukulLogo />
                <h1 className="text-xl font-bold text-gray-800">NavGurukul AI Assistant</h1>
            </div>
            <button
                onClick={onClearHistory}
                className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Clear chat history"
            >
                Clear Chat
            </button>
        </header>
    );
};

export default Header;