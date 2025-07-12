"use client"
import { useEffect, useState, useRef } from 'react';

const AdminDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingGame, setStartingGame] = useState(false);
  const [resettingGame, setResettingGame] = useState(false);
  const [message, setMessage] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [locationForm, setLocationForm] = useState({ locationName: '', hint: '' });
  const [questionForm, setQuestionForm] = useState({ questionText: '', correctAnswer: '', sequenceNumber: '' });
  const [gameConfig, setGameConfig] = useState({ numLocations: 0, numQuestions: 0 });
  const [showAIGenModal, setShowAIGenModal] = useState(false);
  const [aiGenTopic, setAIGenTopic] = useState('');
  const [aiGenCount, setAIGenCount] = useState(5);
  const [aiGenLoading, setAIGenLoading] = useState(false);
  const [aiGenQuestions, setAIGenQuestions] = useState([]);
  const [aiGenError, setAIGenError] = useState('');
  const [aiReviewIndex, setAIReviewIndex] = useState(0);
  const [aiReviewEdits, setAIReviewEdits] = useState([]);
  const [aiGenDifficulty, setAIGenDifficulty] = useState('Medium');
  const [aiGenType, setAIGenType] = useState('Short Answer');
  const [aiCollapseAll, setAICollapseAll] = useState(false);
  const [aiToast, setAIToast] = useState({ show: false, message: '', type: '' });

  // Fetch the team status every 5 seconds
  useEffect(() => {
    const fetchTeamStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin');
        const data = await response.json();
        
        if (data.status === 'success') {
          setTeams(data.teams);
          setGameStatus(data.gameStatus);
          setLoading(false);
        } else {
          console.error('Failed to fetch team status:', data.message);
        }
      } catch (error) {
        console.error('Error fetching team status:', error);
      }
    };

    // Fetch initially and then every 5 seconds
    fetchTeamStatus();
    const interval = setInterval(fetchTeamStatus, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch locations, questions, and config
  useEffect(() => {
    fetchLocations();
    fetchQuestions();
    fetchGameConfig();
  }, []);

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    const data = await res.json();
    setLocations(data);
  };
  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data);
  };
  const fetchGameConfig = async () => {
    const res = await fetch('/api/gameConfig');
    const data = await res.json();
    setGameConfig(data);
  };

  const handleStartGame = async () => {
    setStartingGame(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3000/api/startGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          durationHours: parseInt(durationHours),
          durationMinutes: parseInt(durationMinutes)
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Game started successfully!');
        // Refresh the dashboard
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(data.message || 'Failed to start game');
      }
    } catch (error) {
      setMessage('Error starting game');
      console.error('Error starting game:', error);
    } finally {
      setStartingGame(false);
    }
  };

  const handleResetGame = async () => {
    if (!confirm('Are you sure you want to reset the game? This will clear all team progress.')) {
      return;
    }

    setResettingGame(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3000/api/resetGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Game reset successfully!');
        // Reset duration inputs to default
        setDurationHours(2);
        setDurationMinutes(0);
        // Refresh the dashboard
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(data.message || 'Failed to reset game');
      }
    } catch (error) {
      setMessage('Error resetting game');
      console.error('Error resetting game:', error);
    } finally {
      setResettingGame(false);
    }
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

  // Location CRUD
  const handleLocationSave = async () => {
    if (editingLocation) {
      await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...locationForm, _id: editingLocation._id })
      });
    } else {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationForm)
      });
    }
    setShowLocationModal(false);
    setEditingLocation(null);
    setLocationForm({ locationName: '', hint: '' });
    fetchLocations();
    fetchGameConfig();
  };
  const handleLocationEdit = (loc) => {
    setEditingLocation(loc);
    setLocationForm({ locationName: loc.locationName, hint: loc.hint });
    setShowLocationModal(true);
  };
  const handleLocationDelete = async (_id) => {
    await fetch('/api/locations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id })
    });
    fetchLocations();
    fetchGameConfig();
  };

  // Question CRUD
  const handleQuestionSave = async () => {
    if (editingQuestion) {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...questionForm, _id: editingQuestion._id })
      });
    } else {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...questionForm, sequenceNumber: parseInt(questionForm.sequenceNumber) })
      });
    }
    setShowQuestionModal(false);
    setEditingQuestion(null);
    setQuestionForm({ questionText: '', correctAnswer: '', sequenceNumber: '' });
    fetchQuestions();
    fetchGameConfig();
  };
  const handleQuestionEdit = (q) => {
    setEditingQuestion(q);
    setQuestionForm({ questionText: q.questionText, correctAnswer: q.correctAnswer, sequenceNumber: q.sequenceNumber });
    setShowQuestionModal(true);
  };
  const handleQuestionDelete = async (_id) => {
    await fetch('/api/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id })
    });
    fetchQuestions();
    fetchGameConfig();
  };

  // AI Question Generation
  const handleAIGenerate = async () => {
    setAIGenLoading(true);
    setAIGenError('');
    setAIGenQuestions([]);
    setAIReviewIndex(0);
    setAIReviewEdits([]);
    try {
      const res = await fetch('/api/generateQuestionsAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiGenTopic,
          numQuestions: aiGenCount,
          difficulty: aiGenDifficulty,
          questionType: aiGenType,
        })
      });
      const data = await res.json();
      if (res.ok && data.questions) {
        setAIGenQuestions(data.questions);
        setAIReviewEdits(data.questions.map(q => ({ ...q })));
        setAIToast({ show: true, message: 'Questions generated!', type: 'success' });
      } else {
        setAIGenError(data.message || 'Failed to generate questions');
        setAIToast({ show: true, message: data.message || 'Failed to generate questions', type: 'error' });
      }
    } catch (e) {
      setAIGenError('Failed to generate questions');
      setAIToast({ show: true, message: 'Failed to generate questions', type: 'error' });
    }
    setAIGenLoading(false);
  };
  const handleAIGenSave = async () => {
    for (const q of aiReviewEdits) {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
    }
    setShowAIGenModal(false);
    setAIGenQuestions([]);
    setAIReviewEdits([]);
    fetchQuestions();
    fetchGameConfig();
  };
  const handleRegenerateQuestion = async (idx) => {
    setAIGenLoading(true);
    setAIToast({ show: false, message: '', type: '' });
    try {
      const res = await fetch('/api/generateQuestionsAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiGenTopic,
          numQuestions: 1,
          difficulty: aiGenDifficulty,
          questionType: aiGenType,
          regenerateIndex: idx,
          existingQuestions: aiReviewEdits
        })
      });
      const data = await res.json();
      if (res.ok && data.questions) {
        setAIGenQuestions(data.questions);
        setAIReviewEdits(data.questions.map(q => ({ ...q })));
        setAIToast({ show: true, message: `Regenerated question ${idx + 1}!`, type: 'success' });
      } else {
        setAIGenError(data.message || 'Failed to regenerate question');
        setAIToast({ show: true, message: data.message || 'Failed to regenerate question', type: 'error' });
      }
    } catch (e) {
      setAIGenError('Failed to regenerate question');
      setAIToast({ show: true, message: 'Failed to regenerate question', type: 'error' });
    }
    setAIGenLoading(false);
  };
  const closeAIToast = () => setAIToast({ show: false, message: '', type: '' });

  if (loading) return <div className="text-center p-8">Loading...</div>;

return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard - Team Status</h1>
        
        {/* Game Status Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Game Status</h2>
          
          {gameStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold">Status</h3>
                <p className={gameStatus.isGameOver ? 'text-red-400' : gameStatus.isGameStarted ? 'text-green-400' : 'text-yellow-400'}>
                  {gameStatus.isGameOver ? 'Game Over' : gameStatus.isGameStarted ? 'Game Running' : 'Not Started'}
                </p>
              </div>
              
              {gameStatus.isGameStarted && !gameStatus.isGameOver && gameStatus.remainingTime && (
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold">Time Remaining</h3>
                  <p className="text-xl font-mono">{formatTime(gameStatus.remainingTime)}</p>
                </div>
              )}
              
              {gameStatus.startTime && (
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold">Start Time</h3>
                  <p>{new Date(gameStatus.startTime).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Game Duration Configuration */}
          {gameStatus && !gameStatus.isGameStarted && !gameStatus.isGameOver && (
            <div className="bg-gray-700 p-4 rounded mb-4">
              <h3 className="font-semibold mb-3">Set Game Duration</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Hours:</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 p-2 rounded bg-gray-800 text-white border border-gray-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Minutes:</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-16 p-2 rounded bg-gray-800 text-white border border-gray-600"
                  />
                </div>
                <div className="text-sm text-gray-300">
                  Total: {formatDuration(durationHours, durationMinutes)}
                </div>
              </div>
            </div>
          )}
          
          {/* Game Control Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {gameStatus && !gameStatus.isGameStarted && !gameStatus.isGameOver && (
              <button
                onClick={handleStartGame}
                disabled={startingGame || (durationHours === 0 && durationMinutes === 0)}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                {startingGame ? 'Starting Game...' : 'Start Game'}
              </button>
            )}
            
            <button
              onClick={handleResetGame}
              disabled={resettingGame}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              {resettingGame ? 'Resetting...' : 'Reset Game'}
            </button>
          </div>
          
          {message && (
            <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          
          {/* Winner Announcement */}
          {gameStatus && gameStatus.isGameOver && gameStatus.winner && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-6 rounded-lg text-center mt-4">
              <h3 className="text-2xl font-bold mb-2">🏆 WINNER ANNOUNCED! 🏆</h3>
              <p className="text-xl">
                Congratulations to <span className="font-bold">{gameStatus.winner.teamName}</span>!
              </p>
              <p className="text-lg">
                They answered {gameStatus.winner.questionsAnswered} questions correctly!
              </p>
            </div>
          )}
        </div>

        {/* Game Setup Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Game Setup</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="bg-gray-700 p-4 rounded flex-1">
              <h3 className="font-semibold mb-2">Locations ({gameConfig.numLocations})</h3>
              <button onClick={() => { setShowLocationModal(true); setEditingLocation(null); setLocationForm({ locationName: '', hint: '' }); }} className="bg-blue-600 px-4 py-2 rounded mb-2">Manage Locations</button>
              <ul className="text-sm mt-2 max-h-32 overflow-y-auto">
                {locations.map(loc => (
                  <li key={loc._id} className="flex justify-between items-center border-b border-gray-600 py-1">
                    <span>{loc.locationName}: {loc.hint}</span>
                    <span>
                      <button onClick={() => handleLocationEdit(loc)} className="text-yellow-400 px-2">Edit</button>
                      <button onClick={() => handleLocationDelete(loc._id)} className="text-red-400 px-2">Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-700 p-4 rounded flex-1">
              <h3 className="font-semibold mb-2">Questions ({gameConfig.numQuestions})</h3>
              <div className="flex gap-2 mb-2">
                <button onClick={() => { setShowQuestionModal(true); setEditingQuestion(null); setQuestionForm({ questionText: '', correctAnswer: '', sequenceNumber: '' }); }} className="bg-blue-600 px-4 py-2 rounded">Add Question</button>
                <button onClick={() => { setShowAIGenModal(true); setAIGenTopic(''); setAIGenCount(5); setAIGenQuestions([]); setAIReviewEdits([]); }} className="bg-green-600 px-4 py-2 rounded">Generate with AI</button>
              </div>
              <ul className="text-sm mt-2 max-h-32 overflow-y-auto">
                {questions.map(q => (
                  <li key={q._id} className="flex justify-between items-center border-b border-gray-600 py-1">
                    <span>Q{q.sequenceNumber}: {q.questionText} <span className="text-green-400">[{q.correctAnswer}]</span></span>
                    <span>
                      <button onClick={() => handleQuestionEdit(q)} className="text-yellow-400 px-2">Edit</button>
                      <button onClick={() => handleQuestionDelete(q._id)} className="text-red-400 px-2">Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Team Progress</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-600">
            <thead>
                <tr className="bg-gray-700">
                  <th className="border border-gray-600 px-4 py-2 text-left">Rank</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Team Name</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Location Path</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Current Location</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Questions Answered</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Current Question</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
                </tr>
            </thead>
            <tbody>
                {teams.map((team, index) => (
                  <tr key={index} className={team.isWinner ? 'bg-yellow-900' : 'bg-gray-900'}>
                    <td className="border border-gray-600 px-4 py-2 font-bold">#{index + 1}</td>
                    <td className="border border-gray-600 px-4 py-2 font-semibold">
                      {team.teamName}
                      {team.isWinner && <span className="ml-2">👑</span>}
                    </td>
                    <td className="border border-gray-600 px-4 py-2 text-sm">
                      <div className="max-w-xs overflow-hidden">
                        {team.locationPath.split(' -> ').filter(num => {
                          const n = parseInt(num, 10);
                          return n >= 1 && n <= gameConfig.numLocations;
                        }).join(' -> ')}
                      </div>
                    </td>
                    <td className="border border-gray-600 px-4 py-2">{team.currentLocation}</td>
                    <td className="border border-gray-600 px-4 py-2">{team.numberOfQuestionsAnswered}/{gameConfig.numQuestions}</td>
                    <td className="border border-gray-600 px-4 py-2">Q{team.currentQuestionNumber}</td>
                    <td className="border border-gray-600 px-4 py-2">
                      {team.isWinner ? (
                        <span className="text-yellow-400 font-bold">WINNER!</span>
                      ) : team.numberOfQuestionsAnswered === gameConfig.numQuestions ? (
                        <span className="text-green-400">Completed</span>
                      ) : (
                        <span className="text-blue-400">In Progress</span>
                      )}
                    </td>
                    </tr>
                ))}
            </tbody>
        </table>
          </div>
        </div>

        {/* Modals for Locations and Questions */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingLocation ? 'Edit Location' : 'Add Location'}</h2>
              <input type="text" placeholder="Location Name" value={locationForm.locationName} onChange={e => setLocationForm(f => ({ ...f, locationName: e.target.value }))} className="w-full mb-3 p-2 border rounded bg-gray-800 text-white border-gray-600" />
              <input type="text" placeholder="Hint" value={locationForm.hint} onChange={e => setLocationForm(f => ({ ...f, hint: e.target.value }))} className="w-full mb-3 p-2 border rounded bg-gray-800 text-white border-gray-600" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowLocationModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleLocationSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        )}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
              <input type="text" placeholder="Question Text" value={questionForm.questionText} onChange={e => setQuestionForm(f => ({ ...f, questionText: e.target.value }))} className="w-full mb-3 p-2 border rounded bg-gray-800 text-white border-gray-600" />
              <input type="text" placeholder="Correct Answer" value={questionForm.correctAnswer} onChange={e => setQuestionForm(f => ({ ...f, correctAnswer: e.target.value }))} className="w-full mb-3 p-2 border rounded bg-gray-800 text-white border-gray-600" />
              <input type="number" placeholder="Sequence Number" value={questionForm.sequenceNumber} onChange={e => setQuestionForm(f => ({ ...f, sequenceNumber: e.target.value }))} className="w-full mb-3 p-2 border rounded bg-gray-800 text-white border-gray-600" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowQuestionModal(false); }} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
                <button onClick={async () => { await handleQuestionSave(); }} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        )}
        {/* AI Question Generation Modal */}
        {showAIGenModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-blue-100 to-purple-200 shadow-2xl p-8 rounded-2xl w-full max-w-2xl relative animate-fadeIn">
              <h2 className="text-2xl font-extrabold mb-4 text-center text-purple-800 flex items-center justify-center gap-2">
                <span>🤖</span> AI Question Generator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Topic" value={aiGenTopic} onChange={e => setAIGenTopic(e.target.value)} className="p-3 rounded border-2 border-purple-300 focus:border-purple-500 outline-none bg-gray-800 text-white border-gray-600" />
                <input type="number" min={1} max={20} placeholder="Number of Questions" value={aiGenCount} onChange={e => setAIGenCount(Number(e.target.value))} className="p-3 rounded border-2 border-purple-300 focus:border-purple-500 outline-none bg-gray-800 text-white border-gray-600" />
                <select value={aiGenDifficulty} onChange={e => setAIGenDifficulty(e.target.value)} className="p-3 rounded border-2 border-purple-300 focus:border-purple-500 outline-none bg-gray-800 text-white border-gray-600">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <select value={aiGenType} onChange={e => setAIGenType(e.target.value)} className="p-3 rounded border-2 border-purple-300 focus:border-purple-500 outline-none bg-gray-800 text-white border-gray-600">
                  <option>Short Answer</option>
                  <option>MCQ</option>
                  <option>True/False</option>
                </select>
              </div>
              <div className="flex gap-2 mb-4 items-center">
                <button onClick={handleAIGenerate} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform" disabled={aiGenLoading}>{aiGenLoading ? <span className="animate-spin inline-block mr-2">🔄</span> : '✨'} Generate</button>
                <button onClick={() => setShowAIGenModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
                <button onClick={() => setAICollapseAll(c => !c)} className="ml-auto px-4 py-2 rounded bg-purple-200 text-purple-800 font-semibold border border-purple-400">{aiCollapseAll ? 'Expand All' : 'Collapse All'}</button>
              </div>
              {aiGenError && <div className="text-red-600 mb-2 font-semibold">{aiGenError}</div>}
              {/* Progress bar/stepper */}
              {aiReviewEdits.length > 0 && (
                <div className="w-full flex items-center gap-2 mb-4">
                  <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all" style={{ width: `${((aiReviewIndex+1)/aiReviewEdits.length)*100}%` }}></div>
                  </div>
                  <span className="text-xs text-purple-700 font-bold">{aiReviewIndex+1}/{aiReviewEdits.length}</span>
                </div>
              )}
              {/* Card-based review UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {aiReviewEdits.map((q, idx) => (
                  <div key={idx} className={`relative p-4 rounded-xl shadow-lg border-2 transition-all duration-300 ${aiCollapseAll ? 'h-16 overflow-hidden' : 'bg-white'} ${aiReviewIndex === idx ? 'ring-4 ring-purple-300 scale-105' : ''}`}
                    onClick={() => setAIReviewIndex(idx)}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-purple-700">Question {idx+1}</span>
                      <button onClick={e => { e.stopPropagation(); handleRegenerateQuestion(idx); }} className="text-xs bg-gradient-to-r from-blue-400 to-purple-400 text-white px-2 py-1 rounded shadow hover:scale-110 transition-transform">Regenerate</button>
                    </div>
                    {!aiCollapseAll && (
                      <>
                        <input type="text" value={q.questionText} onChange={e => setAIReviewEdits(edits => edits.map((qq, i) => i === idx ? { ...qq, questionText: e.target.value } : qq))} className="w-full mb-2 p-2 border rounded bg-gray-800 text-white border-gray-600" />
                        <input type="text" value={q.correctAnswer} onChange={e => setAIReviewEdits(edits => edits.map((qq, i) => i === idx ? { ...qq, correctAnswer: e.target.value } : qq))} className="w-full mb-2 p-2 border rounded bg-gray-800 text-white border-gray-600" />
                        <input type="number" value={q.sequenceNumber} onChange={e => setAIReviewEdits(edits => edits.map((qq, i) => i === idx ? { ...qq, sequenceNumber: Number(e.target.value) } : qq))} className="w-full mb-2 p-2 border rounded bg-gray-800 text-white border-gray-600" />
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Save All button */}
              {aiReviewEdits.length > 0 && (
                <div className="flex gap-2 justify-end mt-4">
                  <button onClick={handleAIGenSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform">Save All</button>
                </div>
              )}
              {/* Toast for feedback */}
              {aiToast.show && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg font-bold text-center z-50 ${aiToast.type === 'success' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>{aiToast.message}<button className="ml-4 text-lg font-bold" onClick={closeAIToast}>×</button></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
);
};

export default AdminDashboard;
