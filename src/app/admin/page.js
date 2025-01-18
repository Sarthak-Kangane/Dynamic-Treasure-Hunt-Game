"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handlePasswordSubmit = () => {
        const correctPassword = 'admin'; // Replace with actual password logic
        if (password === correctPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        router.push('/'); // Redirect to home or login page after logout
    };

    const handleRegisterClick = () => {
        router.push('/register'); // Redirect to the Register page
    };

    const handleDashboardClick = () => {
        router.push('/dashboard'); // Redirect to the Admin Dashboard page
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-800">
                <div className="bg-black p-8 rounded-md shadow-md w-80">
                    <h2 className="text-2xl font-semibold text-center mb-4 text-white">Please enter admin password</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full p-2 border border-gray-300 rounded-md text-black mb-4"
                    />
                    <button onClick={handlePasswordSubmit} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                        Submit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-800">
            <div className="bg-black p-8 rounded-md shadow-md w-80">
                <h1 className="text-2xl font-semibold text-center mb-4 text-white">Admin Page</h1>
                <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 mb-4">
                    Log out
                </button>
                <button onClick={handleRegisterClick} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mb-4">
                    Register a Team
                </button>
                <button onClick={handleDashboardClick} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mb-4">
                    See Dashboard
                </button>
            </div>
        </div>
    );
};

export default AdminPage;
