import React from 'react';

interface HeaderProps {
    onClearHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearHistory }) => {
    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoKn6DHDfBdjhQFpUUuGoukHeSY9Bh2LZodQ&s" alt="NavGurukul Logo" className="h-10" />
                <h1 className="text-xl font-bold text-gray-800">NavGurukul AI Assistant</h1>
            </div>
            <button
                onClick={onClearHistory}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
            >
                Clear History
            </button>
        </header>
    );
};

export default Header;
