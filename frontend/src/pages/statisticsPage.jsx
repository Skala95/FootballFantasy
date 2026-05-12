import { useState, useEffect } from "react";
import axios from "axios";

function StatisticsPage() {
    const [players, setPlayers] = useState([]);
    const [sortField, setSortField] = useState("totalPoints");
    const [sortDirection, setSortDirection] = useState("desc");

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    //const sortedPlayers = [...players].filter(p => p.appearances > 0).sort((a, b) => {
    const sortedPlayers = [...players].sort((a, b) => {
        if (sortDirection === "desc") return b[sortField] - a[sortField];
        return a[sortField] - b[sortField];
    });

    useEffect(() => {
        axios.get("/api/players")
            .then(response => setPlayers(response.data))
            .catch(error => console.error("Greska:", error));
    }, []);

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Statistika igrača</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-green-600 text-white">
                        <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Nadimak</th>
                            <th className="p-3 text-left">Ime i Prezime</th>
                            <th className="p-3 text-center">Utakmice</th>
                            <th className="p-3 text-center" onClick={() => handleSort("goals")}>
                                Golovi {sortField === "goals" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("assists")}>
                                Asistencije {sortField === "assists" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("ownGoals")}>
                                Autogolovi {sortField === "ownGoals" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("wins")}>
                                Pobede {sortField === "wins" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("draws")}>
                                Remiji {sortField === "draws" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("losses")}>
                                Porazi {sortField === "losses" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("totalPoints")}>
                                Ukupno poena {sortField === "totalPoints" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                            <th className="p-3 text-center" onClick={() => handleSort("averagePoints")}>
                                Prosek poena {sortField === "averagePoints" ? (sortDirection === 'desc' ? '↓' : '↑') : ""} </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player, index) => (
                            <tr key={player._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-semibold">{player.nickname}</td>
                                <td className="p-3">{player.firstName} {player.lastName}</td>
                                <td className="p-3 text-center">{player.appearances}</td>
                                <td className="p-3 text-center">{player.goals}</td>
                                <td className="p-3 text-center">{player.assists}</td>
                                <td className="p-3 text-center">{player.ownGoals}</td>
                                <td className="p-3 text-center">{player.wins}</td>
                                <td className="p-3 text-center">{player.losses}</td>
                                <td className="p-3 text-center">{player.draws}</td>
                                <td className="p-3 text-center font-bold">{player.totalPoints}</td>
                                <td className="p-3 text-center">
                                    {player.appearances > 0 
                                        ? (player.totalPoints / player.appearances).toFixed(1) 
                                        : "0.0"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StatisticsPage;