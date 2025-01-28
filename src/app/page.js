"use client";
import { useRouter } from "next/navigation";

const Home = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Welcome to the Treasure Hunt App</h1>
                <div className="space-y-4">
                    <button
                        onClick={() => router.push("/admin")}
                        className="w-64 py-3 bg-blue-500 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
                    >
                        Admin
                    </button>
                    <button
                        onClick={() => router.push("/userLogin")}
                        className="w-64 py-3 bg-green-500 rounded-lg text-lg font-semibold hover:bg-green-600 transition"
                    >
                        User Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
