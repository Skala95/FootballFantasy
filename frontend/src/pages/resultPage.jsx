import {useState, useEffect} from 'react';
import axios from 'axios';

function ResultPage() {

    const [matches, setMatches] = useState([]);
    const [openMatchId, setOpenMatchId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    const fetchMatches = async () => {
        try {
            const res = await axios.get("/api/matches");
            const finished = res.data.filter(m => m.status === 'finished');
            setMatches(finished);
        } catch (error) {   
                console.error("Greška prilikom dohvatanja rezultata:", error);
                setError("Došlo je do greške prilikom dohvatanja rezultata");
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleToggle = (id) => {
        if (openMatchId === id) {
            setOpenMatchId(null);      
        } else {
            setOpenMatchId(id);     
        }
    };

    return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Rezultati</h2>
            <div className="flex gap-4 text-sm text-gray-600">
                <span>⚽ Gol</span>
                <span>👟 Asistencija</span>
                <span>🔴 Autogol</span>
            </div>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex flex-col gap-3">
            {matches.map(match => (
                <div key={match._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleToggle(match._id)}
                    >
                        <span className="font-bold">Termin {match.matchNumber}</span>
                        <span className="text-gray-500">{new Date(match.date).toLocaleString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                        <span>{openMatchId === match._id ? '▲' : '▼'}</span>
                    </div>

                    {openMatchId === match._id && (
                        <div className="p-4 border-t">
                            {(() => {
                                const goalsTeam1 = match.stats.filter(s => {
                                    const pid = (s.player?._id || s.player).toString();
                                    const inTeam1 = match.team1.some(p => p._id.toString() === pid);
                                    return inTeam1 && s.stats === 'goal' || !inTeam1 && s.stats === 'ownGoal' && match.team2.some(p => p._id.toString() === pid);
                                }).length;
                                const goalsTeam2 = match.stats.filter(s => {
                                    const pid = (s.player?._id || s.player).toString();
                                    const inTeam2 = match.team2.some(p => p._id.toString() === pid);
                                    return inTeam2 && s.stats === 'goal' || !inTeam2 && s.stats === 'ownGoal' && match.team1.some(p => p._id.toString() === pid);
                                }).length;
                                return (
                                    <div className="text-center text-2xl font-bold mb-4">
                                        <span className="text-gray-600">Tim 1</span>
                                        <span className="mx-4 text-gray-700">{goalsTeam1} : {goalsTeam2}</span>
                                        <span className="text-gray-600">Tim 2</span>
                                    </div>
                                );
                            })()}
                            <div className="flex gap-8">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-600 mb-2">Tim 1</h4>
                                {match.team1.map(player => {
                                    const goals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'goal').length;
                                    const assists = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'assist').length;
                                    const ownGoals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'ownGoal').length;
                                    return (
                                        <div key={player._id} className="flex items-center py-1 border-b">
                                            <span className="font-semibold w-28">{player.nickname}</span>
                                            <span className="text-sm">
                                                {'⚽'.repeat(goals)}
                                                {'👟'.repeat(assists)}
                                                {'🔴'.repeat(ownGoals)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-600 mb-2">Tim 2</h4>
                                {match.team2.map(player => {
                                    const goals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'goal').length;
                                    const assists = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'assist').length;
                                    const ownGoals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'ownGoal').length;
                                    return (
                                        <div key={player._id} className="flex items-center py-1 border-b">
                                            <span className="font-semibold w-28">{player.nickname}</span>
                                            <span className="text-sm">
                                                {'⚽'.repeat(goals)}
                                                {'👟'.repeat(assists)}
                                                {'🔴'.repeat(ownGoals)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
    );

}

export default ResultPage;