"use client";
import { useState, useEffect } from "react";
import QRScanner from "./QRScanner"; // Import the QRScanner component
import GameBanner from "./GameBanner";

const AnswerVerification = () => {
    const [teamName, setTeamName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [answer, setAnswer] = useState("");
    const [currLocation, setCurrLocation] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [locationHint, setLocationHint] = useState(""); // New state for location hint
    const [teamData, setTeamData] = useState(null); // Store team data for location info
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false); // To toggle the QR scanner
    const [leaderboardData, setLeaderboardData] = useState([]); // For leaderboard data
    const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false); // Toggle leaderboard visibility
    const [gameStatus, setGameStatus] = useState(null);
    const [showWinnerBanner, setShowWinnerBanner] = useState(false);
    const [winnerTeam, setWinnerTeam] = useState(null);
    const [gameConfig, setGameConfig] = useState({ numQuestions: 12 });

    // Retrieve teamName from localStorage or props (if using props)
    useEffect(() => {
        const storedTeamName = localStorage.getItem("teamName");
        if (storedTeamName) {
            setTeamName(storedTeamName);
        }
    }, []);

    // Fetch game status periodically
    useEffect(() => {
        const fetchGameStatus = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/gameStatus");
                const data = await response.json();
                setGameStatus(data);
                
                // Show winner banner if game is over and there's a winner
                if (data.isGameOver && data.winner) {
                    setShowWinnerBanner(true);
                    setWinnerTeam(data.winner.teamName);
                }
            } catch (error) {
                console.error("Error fetching game status:", error);
            }
        };

        fetchGameStatus();
        const interval = setInterval(fetchGameStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch gameConfig and leaderboard every 5 seconds
    useEffect(() => {
        const fetchGameConfig = async () => {
            const res = await fetch('/api/gameConfig');
            const data = await res.json();
            setGameConfig(data);
        };
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("/api/admin");
                const data = await response.json();
                if (response.ok) {
                    const sortedLeaderboard = data.teams.sort(
                        (a, b) => b.numberOfQuestionsAnswered - a.numberOfQuestionsAnswered
                    );
                    setLeaderboardData(sortedLeaderboard);
                }
            } catch (error) {
                // ignore
            }
        };
        fetchGameConfig();
        fetchLeaderboard();
        const interval = setInterval(() => {
            fetchGameConfig();
            fetchLeaderboard();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleFetchTeamId = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const teamResponse = await fetch(`http://localhost:3000/api/getTeamID`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamName }),
            });

            const teamData = await teamResponse.json();

            if (!teamResponse.ok) {
                throw new Error(teamData.message || "Failed to fetch team ID");
            }

            const fetchedTeamId = teamData.teamId;
            setTeamId(fetchedTeamId);
            setTeamData(teamData); // Store team data for location info
            setLocationHint(teamData.locationHint); // Set location hint from API response

            const questionResponse = await fetch("http://localhost:3000/api/getQuestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamId: fetchedTeamId }),
            });

            const questionData = await questionResponse.json();

            if (!questionResponse.ok) {
                throw new Error(questionData.message || "Failed to fetch the current question");
            }

            setCurrentQuestion(questionData.question.questionText);

            // Location hint will be fetched automatically by useEffect when teamData is set
        } catch (error) {
            setMessageType("error");
            setMessage(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch("http://localhost:3000/api/answerQuestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teamId,
                    answer,
                    curr_location: parseInt(currLocation),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessageType("success");
                setMessage(data.message);

                // Check if this team won
                if (data.isWinner) {
                    setShowWinnerBanner(true);
                    setWinnerTeam(data.teamName);
                }

                // Clear the answer and location fields before fetching the next question
                setAnswer("");
                setCurrLocation("");

                // Delay fetching the next question by 2 seconds
                setTimeout(() => {
                    handleFetchTeamId();
                }, 2000);
            } else {
                setMessageType("error");
                setMessage(data.message || "An error occurred");
            }
        } catch (error) {
            setMessageType("error");
            setMessage(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = (locationId) => {
        setCurrLocation(locationId); // Update current location with scanned location ID
        setIsScannerOpen(false); // Close the QR scanner
    };

    const formatTime = (milliseconds) => {
        if (!milliseconds) return 'N/A';
        
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDuration = (hours, minutes) => {
        if (hours === 0 && minutes === 0) return '0 minutes';
        if (hours === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {showWinnerBanner && <GameBanner winner={winnerTeam} />}
            
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Answer Verification</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Main Form */}
                    <div className="bg-black p-6 rounded-lg shadow-lg">
                        {/* Game Status Display */}
                        {gameStatus && (
                            <div className="mb-6 p-4 bg-gray-700 rounded-md">
                                <h2 className="text-lg font-bold mb-2">Game Status</h2>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        Status: 
                                        <span className={`ml-2 ${
                                            gameStatus.isGameOver ? 'text-red-400' : 
                                            gameStatus.isGameStarted ? 'text-green-400' : 'text-yellow-400'
                                        }`}>
                                            {gameStatus.isGameOver ? 'Game Over' : 
                                             gameStatus.isGameStarted ? 'Game Running' : 'Not Started'}
                                        </span>
                                    </p>
                                    {gameStatus.isGameStarted && !gameStatus.isGameOver && gameStatus.remainingTime && (
                                        <p>Time Remaining: <span className="font-mono">{formatTime(gameStatus.remainingTime)}</span></p>
                                    )}
                                    {gameStatus.startTime && (
                                        <p>Started: {new Date(gameStatus.startTime).toLocaleTimeString()}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="teamName" className="block text-sm font-medium mb-2">
                                Team Name
                            </label>
                            <input
                                type="text"
                                id="teamName"
                                value={teamName}
                                disabled // Make the team name field non-editable
                                className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                            />
                            <button
                                onClick={handleFetchTeamId}
                                disabled={loading || (gameStatus && !gameStatus.isGameStarted)}
                                className="mt-2 w-full py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-800"
                            >
                                {loading ? "Fetching..." : "Fetch Team"}
                            </button>
                        </div>

                        {currentQuestion && (
                            <div className="mb-4 p-4 bg-gray-700 text-white rounded-md">
                                <h2 className="text-lg font-bold mb-2">Current Question</h2>
                                <p>{currentQuestion}</p>
                            </div>
                        )}
                        {locationHint && (
                            <div className="mb-4 p-4 bg-gray-700 rounded-md">
                                <h2 className="text-lg font-bold mb-2">Location Hint</h2>
                                <p>{locationHint}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Current Location
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={currLocation ? `Location ${currLocation}` : "Scan QR code to set location"}
                                        disabled
                                        className="flex-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                                        placeholder="Scan QR code to set location"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsScannerOpen(true)}
                                        disabled={loading || (gameStatus && !gameStatus.isGameStarted)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-800"
                                    >
                                        Scan QR
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="answer" className="block text-sm font-medium mb-2">
                                    Your Answer
                                </label>
                                <input
                                    type="text"
                                    id="answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Enter your answer"
                                    required
                                    disabled={loading || (gameStatus && !gameStatus.isGameStarted) || !currLocation}
                                    className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                                />
                            </div>

                            {message && (
                                <p
                                    className={`text-sm font-medium mb-4 ${
                                        messageType === "success" ? "text-green-500" : "text-red-500"
                                    }`}
                                >
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (gameStatus && !gameStatus.isGameStarted) || !currLocation}
                                className="w-full py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-800"
                            >
                                {loading ? "Verifying..." : "Submit Answer"}
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Leaderboard */}
                    <div className="bg-black p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Leaderboard</h2>
                        </div>
                        
                        {leaderboardData.length > 0 ? (
                            <div className="space-y-2">
                                {leaderboardData.map((team, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-bold text-lg">#{index + 1}</span>
                                            <span className="font-semibold">{team.teamName}</span>
                                        </div>
                                        <span className="text-blue-400 font-bold">{team.numberOfQuestionsAnswered}/{gameConfig.numQuestions}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No teams yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {isScannerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Scan QR Code</h3>
                            <p className="text-gray-600 text-sm">Point your camera at the QR code</p>
                        </div>
                        <div className="mb-4">
                            <QRScanner onScanSuccess={handleScanSuccess} />
                        </div>
                        <button
                            onClick={() => setIsScannerOpen(false)}
                            className="w-full py-3 bg-red-500 text-white rounded-md hover:bg-red-600 font-semibold"
                        >
                            Close Scanner
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnswerVerification;