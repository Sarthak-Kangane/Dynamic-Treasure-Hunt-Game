import React from "react";

const GameBanner = ({ winner }) => {
    return (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white text-center animate-slide-down shadow-lg z-50">
            <h2 className="text-3xl font-bold">🏆 Game Over! 🏆</h2>
            <p className="text-xl mt-2">🎉 Congratulations to the Winner <span className="font-semibold">{winner}</span> 🎉</p>
        </div>
    );
};

export default GameBanner;
