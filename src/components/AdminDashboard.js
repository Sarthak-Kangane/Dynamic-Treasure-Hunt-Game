"use client"
import { useEffect, useState } from 'react';
const AdminDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the team status every 5 seconds
  useEffect(() => {
    const fetchTeamStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin');  // Call your backend endpoint here
        const data = await response.json();
        
        if (data.status === 'success') {
          setTeams(data.teams);  // Set the teams data to state
          setLoading(false);      // Stop loading
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

  if (loading) return <div>Loading...</div>;

return (
    <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
        <h1><strong>Admin Dashboard - Team Status</strong></h1>
        <br></br>
        <table className="min-w-full table-auto border-collapse border border-gray-300" style={{ margin: '0 auto' }}>
            <thead>
                <tr>
                    <th className="border-b px-4 py-2 text-left">Team Name</th>
                    <th className="border-b px-4 py-2 text-left">Location Path</th>
                    <th className="border-b px-4 py-2 text-left">Current Location</th>
                    <th className="border-b px-4 py-2 text-left">Questions Answered</th>
                    <th className="border-b px-4 py-2 text-left">Current Question</th>
                </tr>
            </thead>
            <tbody>
                {teams.map((team, index) => (
                    <tr key={index} style={{ backgroundColor: 'black', color: 'white' }}>
                        <td className="border-b px-4 py-2">{team.teamName}</td>
                        <td className="border-b px-4 py-2">{team.locationPath}</td>
                        <td className="border-b px-4 py-2">{team.currentLocation}</td>
                        <td className="border-b px-4 py-2">{team.numberOfQuestionsAnswered}</td>
                        <td className="border-b px-4 py-2">Q{team.currentQuestionNumber}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
};

export default AdminDashboard;
