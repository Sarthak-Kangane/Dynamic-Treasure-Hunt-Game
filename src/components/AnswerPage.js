"use client";
import { useState, useEffect } from "react";
import QRScanner from "./QRScanner"; // Import the QRScanner component
import GameBanner from './GameBanner'; // Import the new GameBanner

const AnswerVerification = () => {
    const [teamName, setTeamName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [answer, setAnswer] = useState("");
    const [currLocation, setCurrLocation] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [locationHint, setLocationHint] = useState(""); // New state for location hint
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false); // To toggle the QR scanner
    const [leaderboardData, setLeaderboardData] = useState([]); // For leaderboard data
    const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false); // Toggle leaderboard visibility
    const [gameStatus, setGameStatus] = useState(null);
    const [winner, setWinner] = useState(null);

    // Retrieve teamName from localStorage or props (if using props)
    useEffect(() => {
        const storedTeamName = localStorage.getItem("teamName");
        if (storedTeamName) {
            setTeamName(storedTeamName);
        }
    }, []);

    // Fetch the game status and winner from the declareWinner API
    useEffect(() => {
        const checkGameStatus = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/declareWinner", {
                    method: "POST",
                });

                const data = await response.json();

                if (response.ok && data.winner) {
                    setGameStatus("over");
                    setWinner(data.winner);
                } else {
                    setGameStatus("ongoing");
                }
            } catch (error) {
                console.error("Error fetching game status:", error);
            }
        };

        checkGameStatus();
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

            // Get location hints
            const locationIndex = teamData.currentLocation;
            if (locationIndex !== undefined) {
                const locationResponse = await fetch(`/api/getLocationHint`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ locationName: locationIndex }),
                });

                const locationData = await locationResponse.json();
                if (!locationResponse.ok) throw new Error(locationData.message || "Failed to fetch location hint");

                setLocationHint(locationData.hint);
            } else {
                setLocationHint("Location hint not available.");
            }
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

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin");
            const data = await response.json();

            if (response.ok) {
                const sortedLeaderboard = data.teams.sort(
                    (a, b) => b.numberOfQuestionsAnswered - a.numberOfQuestionsAnswered
                );
                setLeaderboardData(sortedLeaderboard);
                setIsLeaderboardVisible(!isLeaderboardVisible); // Toggle visibility
            } else {
                setMessage("Error fetching leaderboard");
            }
        } catch (error) {
            setMessage("Error fetching leaderboard");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-800 text-white">
            {/* Conditionally render the GameBanner if the game is over */}
            <GameBanner gameStatus={gameStatus} winner={winner?.teamName} />

            <div className="bg-black p-8 rounded-md shadow-lg w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Answer Verification</h1>
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
                        disabled={loading || gameStatus === "over"}
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
                        <label htmlFor="answer" className="block text-sm font-medium mb-2">
                            Answer
                        </label>
                        <input
                            type="text"
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            required
                            disabled={gameStatus === "over"} // Disable the answer input when game is over
                            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="currLocation" className="block text-sm font-medium mb-2">
                            Current Location
                        </label>
                        <input
                            type="text"
                            id="currLocation"
                            value={currLocation}
                            disabled
                            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                        />
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)} // Open the QR scanner when clicked
                            className="mt-2 w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            disabled={gameStatus === "over"} // Disable QR scan button when game is over
                        >
                            Scan QR Code
                        </button>
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
                        disabled={loading || gameStatus === "over"} // Disable submit when game is over
                        className="w-full py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-800"
                    >
                        {loading ? "Verifying..." : "Submit Answer"}
                    </button>
                </form>

                {/* Leaderboard Button */}
                {/* <button
                    onClick={fetchLeaderboard}
                    className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {isLeaderboardVisible ? "Close Leaderboard" : "Show Leaderboard"}
                </button> */}

                {/* Display Leaderboard */}
                {/* {isLeaderboardVisible && (
                    <div className="mt-6 text-white">
                        <h2 className="text-xl font-semibold text-center mb-4">Leaderboard</h2>
                        <ul className="space-y-2">
                            {leaderboardData.map((team, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>{team.teamName}</span>
                                    <span>{team.numberOfQuestionsAnswered} Questions Answered</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )} */}
            </div>

            {isScannerOpen && (
                <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />
            )}
        </div>
    );
};

export default AnswerVerification;
