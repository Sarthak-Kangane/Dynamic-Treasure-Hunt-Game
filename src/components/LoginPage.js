"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const [teamName, setTeamName] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Reset error message
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:3000/api/loginCheck", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamName, password }),
            });

            const data = await response.json();

            if (response.status === 200) {
                // Store teamName in localStorage after successful login
                localStorage.setItem("teamName", teamName);

                // Redirect to answer page on successful login
                router.push("/answer");
            } else {
                // Display error message
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error("Error during login:", err);
            setErrorMessage("An error occurred while logging in.");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-800">
            <div className="bg-black p-8 rounded-md shadow-md w-80">
                <h1 className="text-2xl font-semibold text-center mb-4 text-white">
                    Login to Your Team
                </h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label
                            htmlFor="teamName"
                            className="block text-sm font-medium text-white"
                        >
                            Team Name
                        </label>
                        <input
                            type="text"
                            id="teamName"
                            name="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-white"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    <div className="mt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
