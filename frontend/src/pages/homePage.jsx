import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext} from "react-router-dom";

function HomePage() {
    const context = useOutletContext();
    const userData = context?.userData; 
    const [nextMatch, setNextMatch] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [myTotalPoints, setMyTotalPoints] = useState(null);
    const [topPlayers, setTopPlayers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        

        // Sledeca utakmica (najbliza open)
        axios.get("/api/matches", { headers })
            .then(res => {
                const openMatches = res.data
                    .filter(m => m.status === "open")
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setNextMatch(openMatches[0] || null);
            })
            .catch(err => console.error("Greška pri dohvatanju utakmica:", err));

        // Rang i poeni korisnika
        axios.get("/api/fantasy-teams/leaderboard", { headers })
            .then(res => {
                const idx = res.data.findIndex(u => String(u.userId) === String(userData?._id));
                if (idx !== -1) {
                    setMyRank(idx + 1);
                    setMyTotalPoints(res.data[idx].totalPoints);
                } else {
                    setMyRank(null);
                    setMyTotalPoints(0);
                }
            })
            .catch(err => console.error("Greška pri dohvatanju leaderboard-a:", err));

        // Top 3 igraci po totalPoints
        axios.get("/api/players")
            .then(res => {
                const sorted = [...res.data].sort((a, b) => b.totalPoints - a.totalPoints);
                setTopPlayers(sorted.slice(0, 3));
            })
            .catch(err => console.error("Greška pri dohvatanju igraca:", err));
    }, [userData]);

    const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
    const medals = ["🥇", "🥈", "🥉"];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Pozdrav */}
            <div className="bg-green-700 text-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-4xl font-bold mb-1">
                    Dobrodošao, {userData?.firstName}! 👋
                </h2>
                <p className="text-green-200 text-lg">Dobro došao na Football Fantasy platformu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sledeći termin */}
                <div
                    className={`bg-white rounded-2xl shadow-lg p-6 ${nextMatch ? "cursor-pointer hover:bg-green-50 transition" : ""}`}
                    onClick={() => nextMatch && navigate("/dashboard/fantasy-team")}
                >
                    <h3 className="text-xl font-bold text-gray-700 mb-4">⚽ Sledeći termin</h3>
                    {nextMatch ? (
                        <div>                            
                            {nextMatch.date && (
                                <p className="text-gray-500 text-sm">
                                    📅 {new Date(nextMatch.date).toLocaleString("sr-Latn-RS", {
                                        day: "2-digit", month: "2-digit", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            )}
                            {nextMatch.registrationDeadline && (
                                <p className="text-gray-500 text-sm mt-1">
                                    ⏰ Rok za prijavu: {new Date(nextMatch.registrationDeadline).toLocaleString("sr-Latn-RS", {
                                        day: "2-digit", month: "2-digit", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">Nema otvorenih utakmica trenutno.</p>
                    )}
                </div>

                {/* Moji poeni i rang */}
                <div className="bg-white rounded-2xl shadow-lg p-6"
                    onClick={() => navigate("/dashboard/leaderboard")}>
                    <h3 className="text-xl font-bold text-gray-700 mb-4">🏆 Tvoj rezultat u fantasy</h3>
                    <div className="flex items-center justify-around">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600">{myTotalPoints ?? "—"}</p>
                            <p className="text-gray-500 text-sm mt-1">Ukupno poena</p>
                        </div>
                        <div className="w-px h-16 bg-gray-200"></div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600">
                                {myRank !== null ? `#${myRank}` : "—"}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">Rang na tabeli</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 3 igraci */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 cursor-pointer hover:bg-green-50 transition"
                onClick={() => navigate("/dashboard/statistics")}>
                <h3 className="text-xl font-bold text-gray-700 mb-4">🌟 Top 3 igrača</h3>
                {topPlayers.length === 0 ? (
                    <p className="text-gray-400 italic">Nema podataka o igračima.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {topPlayers.map((player, idx) => (
                            <div key={player._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{medals[idx]}</span>
                                    <div>
                                        <p className={`font-bold text-lg ${medalColors[idx]}`}>{player.nickname}</p>
                                        <p className="text-gray-400 text-sm">{player.firstName} {player.lastName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-green-600">{player.totalPoints} pts</p>
                                    <p className="text-gray-400 text-xs">{player.appearances} utakmica</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
