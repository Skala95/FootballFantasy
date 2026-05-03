import { useState, useEffect } from "react";
import axios from "axios";

function FantasyTeamPage() {

    const [matches, setMatches] = useState([]);
    const [closedMatches, setClosedMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [captain, setCaptain] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [myClosedTeams, setMyClosedTeams] = useState({});
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState(false);
    const [openClosedId, setOpenClosedId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchMatches = async () => {
        const res = await axios.get("/api/matches");
        setMatches(res.data.filter(m => m.status === "open"));
        const closed = res.data.filter(m => m.status === "closed" || m.status === "finished");
        setClosedMatches(closed);
        // Dohvati fantasy timove za zatvorene termine
        const teamsMap = {};
        for (const m of closed) {
            try {
                const r = await axios.get(`/api/fantasy-teams/${m._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (r.data) teamsMap[m._id] = r.data;
            } catch {
                console.error(`Nije moguće dohvatiti fantazi tim za termin ${m._id}`);
            }
        }
        setMyClosedTeams(teamsMap);
    }

    const fetchPlayers = async () => {
        const res = await axios.get("/api/players");
        setPlayers(res.data);
    }

    const fetchMyTeam = async (matchId) => {
        try {
            const res = await axios.get(`/api/fantasy-teams/${matchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data) {
                setMyTeam(res.data);
                setSelectedPlayers(res.data.selectedPlayers.map(p => p._id));
                setCaptain(res.data.captain?._id || null);
            } else {
                setMyTeam(null);
                setSelectedPlayers([]);
                setCaptain(null);
            }
        } catch {
            setMyTeam(null);
        }

    };

    useEffect(() => {
        fetchMatches();
        fetchPlayers();
    }, []);

    const handleSelectMatch = async (match, view = false) => {
        setMessage("");
        setError("");
        setViewMode(view);
        await fetchMyTeam(match._id);
        setSelectedMatch(match);
    };

    const handlePlayerSelect = (playerId) => {
        if (selectedPlayers.includes(playerId)) {
            setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
            if (captain === playerId) {
                setCaptain(null);
            }
        } else {
            if (selectedPlayers.length >= 6) {
                setError("Možete izabrati maksimalno 6 igrača");
                return;
            }
            setSelectedPlayers([...selectedPlayers, playerId]);
        }
        setError("");
    };

    const handleSubmit = async () => {
    
        if (selectedPlayers.length !== 6) {
            setError("Morate izabrati tačno 6 igrača");
            return;
        }   
        if (!captain || !selectedPlayers.includes(captain)) {
            setError("Kapiten mora biti među izabranim igračima");
            return;
        }

        try {
            if (myTeam) {
                await axios.put(`/api/fantasy-teams/${myTeam._id}`, {
                    selectedPlayers,
                    captain
                }, { headers: { Authorization: `Bearer ${token}` } });
                setMessage("Fantazi tim uspešno ažuriran!");
            } else {
                await axios.post(`/api/fantasy-teams`, {
                    matchId: selectedMatch._id,
                    selectedPlayers,
                    captain 
                }, { headers: { Authorization: `Bearer ${token}` } });
                setMessage("Fantazi tim uspešno kreiran!");
            }
            setError("");
            fetchMyTeam(selectedMatch._id);
            setSelectedMatch(null); // zatvori tabelu nakon prijave
        } catch (err) {
            setError("Došlo je do greške prilikom čuvanja fantazi tima");
        }
    };

    const handleToggleClosedMatch = (id) => {
        setOpenClosedId(openClosedId === id ? null : id);
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Moj Fantasy Tim</h2>
            {message && <p className="text-green-600 font-semibold mb-4">{message}</p>}
            {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

            {/* Otvoreni termini */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-4">Otvoreni termini</h3>
                {matches.length === 0 ? (
                    <p className="text-gray-600">Nema otvorenih termina</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {matches.map(m => {
                            const hasTeam = myTeam && myTeam.match?._id === m._id || myTeam && myTeam.match === m._id;
                            return (
                                <div key={m._id} className="flex items-center gap-2">
                                    <span className="px-3 py-2 bg-gray-100 rounded">
                                        Sezona {m.season} - Termin {m.matchNumber} ({new Date(m.date).toLocaleString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })})
                                    </span>
                                    {hasTeam && (
                                        <button
                                            onClick={() => handleSelectMatch(m, true)}
                                            className="px-4 py-2 rounded text-white bg-yellow-400 hover:bg-yellow-500">
                                            Pregled
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSelectMatch(m, false)}
                                        className={`px-4 py-2 rounded text-white ${selectedMatch?._id === m._id && !viewMode ? 'bg-gray-400' : hasTeam ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}>
                                        {hasTeam ? 'Ažuriraj' : 'Prijavi'}
                                    </button>                                    
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Izbor igrača za otvoreni termin */}
            {selectedMatch && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-bold mb-2">Izaberi igrače <span className="text-gray-500 text-sm">({selectedPlayers.length}/6)</span></h3>
                    <p className="text-sm text-gray-500 mb-4">Čekiraj igrača da ga dodaš u tim. Klikni na C da postaviš kapitena.</p>
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Izabran</th>
                                <th className="p-2 text-left">Nadimak</th>
                                <th className="p-2 text-left">Ime i prezime</th>
                                <th className="p-2 text-center">Kapiten</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(p => {
                                const isSelected = selectedPlayers.includes(p._id);
                                const isCaptain = captain === p._id;
                                return (
                                    <tr key={p._id} className={`border-b ${isSelected ? 'bg-green-50' : ''}`}>
                                        <td className="p-2">
                                            <input type="checkbox" checked={isSelected} disabled={viewMode} onChange={() => handlePlayerSelect(p._id)} />
                                        </td>
                                        <td className="p-2 font-medium">{p.nickname}</td>
                                        <td className="p-2">{p.firstName} {p.lastName}</td>
                                        <td className="p-2 text-center">
                                            <button
                                                disabled={!isSelected || viewMode}
                                                onClick={() => setCaptain(p._id)}
                                                className={`text-xl ${isCaptain ? 'text-yellow-500' : 'text-gray-300'} disabled:opacity-30`}>
                                                C
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {!viewMode && (
                        <button onClick={handleSubmit} className="mt-6 bg-green-600 text-white px-6 py-2 rounded">
                            {myTeam ? 'Ažuriraj tim' : 'Prijavi tim'}
                        </button>
                    )}
                </div>
            )}

            {/* Zatvoreni termini */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Zatvoreni termini</h3>
                {closedMatches.length === 0 ? (
                    <p className="text-gray-600">Nema zatvorenih termina</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {closedMatches.map(m => {
                            const team = myClosedTeams[m._id];
                            return (
                                <div key={m._id} className="border rounded-lg overflow-hidden">
                                    <div
                                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleToggleClosedMatch(m._id)}
                                    >
                                        <span className="font-bold">Sezona {m.season} - Termin {m.matchNumber}</span>
                                        <span className="text-gray-500">{new Date(m.date).toLocaleString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                                        <span>{openClosedId === m._id ? '▲' : '▼'}</span>
                                    </div>
                                    {openClosedId === m._id && (
                                    <div className="p-4 border-t">
                                    {team ? (
                                        <table className="w-full text-sm mt-2">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-1">Igrač</th>
                                                    <th className="text-center py-1">Gol</th>
                                                    <th className="text-center py-1">Asistencija</th>
                                                    <th className="text-center py-1">Autogol</th>
                                                    <th className="text-center py-1">Poeni</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {team.selectedPlayers?.map(p => {
                                                    const isCaptain = team.captain?._id?.toString() === p._id?.toString() || team.captain?.toString() === p._id?.toString();
                                                    const pid = p._id.toString();
                                                    const goals = m.stats?.filter(s => (s.player?._id || s.player).toString() === pid && s.stats === 'goal').length || 0;
                                                    const assists = m.stats?.filter(s => (s.player?._id || s.player).toString() === pid && s.stats === 'assist').length || 0;
                                                    const ownGoals = m.stats?.filter(s => (s.player?._id || s.player).toString() === pid && s.stats === 'ownGoal').length || 0;
                                                    const pp = team.playerPoints?.find(pp => pp.player?.toString() === pid);
                                                    const pts = pp?.points || 0;
                                                    return (
                                                        <tr key={p._id} className="border-b">
                                                            <td className="py-1">{p.nickname} {isCaptain ? '(C)' : ''}</td>
                                                            <td className="text-center py-1">{goals}</td>
                                                            <td className="text-center py-1">{assists}</td>
                                                            <td className="text-center py-1">{ownGoals}</td>
                                                            <td className="text-center py-1 font-bold">{m.status === 'finished' ? pts : '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                                {/* Dodaj sumu poena ispod svih igrača */}
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="text-center py-2 font-bold border-t">
                                                        Ukupno: {team.selectedPlayers?.reduce((sum, p) => {
                                                            const pid = p._id.toString();
                                                            const pp = team.playerPoints?.find(pp => pp.player?.toString() === pid);
                                                            return sum + (pp?.points || 0);
                                                        }, 0)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-red-500 text-sm">Nisi prijavio tim za ovaj termin</p>
                                    )}
                                    </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );


}

export default FantasyTeamPage;