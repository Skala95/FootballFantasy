import { useState, useEffect } from "react";
import axios from "axios";

function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [sortField, setSortField] = useState("totalPoints");
    const [sortDirection, setSortDirection] = useState("desc");
    const token = localStorage.getItem("token");

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedUsers = [...leaderboard].sort((a, b) => {
        if (sortDirection === "desc") return b[sortField] - a[sortField];
        return a[sortField] - b[sortField];
    });

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get("/api/fantasy-teams/leaderboard", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Leaderboard data:", res.data);
                setLeaderboard(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Tabela Bodova</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-green-600 text-white">
                        <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Ime i prezime</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("matchCount")}>
                                Termini {sortField === "matchCount" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("totalPoints")}>
                                Ukupno bodova {sortField === "totalPoints" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("averagePoints")}>
                                Prosek {sortField === "averagePoints" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((u, index) => (
                            <tr key={u.userId} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-bold">{index + 1}</td>
                                <td className="p-3">{u.firstName} {u.lastName}</td>
                                <td className="p-3 text-center">{u.matchCount}</td>
                                <td className="p-3 text-center font-bold">{u.totalPoints}</td>
                                <td className="p-3 text-center">{u.averagePoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LeaderboardPage;