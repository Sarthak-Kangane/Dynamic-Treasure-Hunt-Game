"use client";
import { useState } from "react";

const Register = () => {
    const [teamName, setTeamName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("http://localhost:3000/api/registerTeam", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamName }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message); // Use the success message from the backend
            } else {
                setError(data.message); // Use the error message from the backend
            }
        } catch (error) {
            setError("An error occurred while registering the team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-800">
            <div className="bg-black p-8 rounded-md shadow-md w-80">
                <h1 className="text-2xl font-semibold text-center mb-4 text-white">
                    Register Your Team
                </h1>
                <form onSubmit={handleSubmit}>
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
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                    <div className="mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
