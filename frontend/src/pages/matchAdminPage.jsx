import { useState, useEffect } from "react";
import axios from "axios";

function MatchAdminPage() {
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const [season, setSeason] = useState("");
    //const [matchNumber, setMatchNumber] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [playerData, setPlayerData] = useState({});
    const [modalMode, setModalMode] = useState('edit'); 

    // Dohvati sve igrace
    const fetchPlayers = async () => {
        const res = await axios.get("/api/players");
        setPlayers(res.data);
    };

    // Dohvati sve termine
    const fetchMatches = async () => {
        const res = await axios.get("/api/matches");
        setMatches(res.data);
    };
    
    useEffect(() => {
        fetchPlayers();
        fetchMatches();
    }, []);

    // Kreiranje novog termina
    const handleCreateMatch = async (e) => {
        e.preventDefault();
        if (!date) {
            setError("Datum i vreme su obavezni.");
            return;
        }
        try {
            await axios.post("/api/matches", {
                season,
                date: new Date(`${date}T${time}`).toISOString()
            },{headers: { Authorization: `Bearer ${token}` }});
            setMessage("Termin je uspešno kreiran!");
            setSeason("");
            setDate("");
            setTime("");
            fetchMatches();
            setError("");
        } catch (error) {
            setError("Greška prilikom kreiranja termina.");
        }
    };

    // Brisanje termina
    const handleDeleteMatch = async (id) => {
        try {
            await axios.delete(`/api/matches/${id}`,{headers: { Authorization: `Bearer ${token}` }});
            setMessage("Termin je uspešno obrisan!");
            fetchMatches();
            setError("");
        } catch (error) {
            setError("Greška prilikom brisanja termina.");
        }
    };

    // Azuriranje termina
    const handleUpdateMatch = async (id, status) => {
        try {
            await axios.put(`/api/matches/${id}/status`, { status },{headers: { Authorization: `Bearer ${token}` }});
            setMessage(`Status termina je uspesno promenjen na ${status === 'open' ? 'Otvoren' : 'Zatvoren'}!`);
            fetchMatches();
            setError("");
        } catch (error) {
            setError("Greška prilikom ažuriranja statusa termina.");
        }
    };

    // Otvaranje modala za unos statistike
    const handleOpenModal = async (match, mode = 'edit') => {
        setMessage("");
        setError("");
        const res = await axios.get("/api/players");
        const freshPlayers = res.data;
        setPlayers(freshPlayers);
        setSelectedMatch(match);
        setModalMode(mode);
        console.log('status:', match.status);
        console.log('stats:', match.stats);
        console.log('team1:', match.team1);
        console.log('team2:', match.team2);
        const initial = {};
        freshPlayers.forEach(p => {
            const id = p._id;
            // Proveri da li je igrac u team1 ili team2
            const inTeam1 = match.team1?.some(t => (t._id || t) === id || (t._id || t).toString() === id.toString());
            const inTeam2 = match.team2?.some(t => (t._id || t) === id || (t._id || t).toString() === id.toString());
            const team = inTeam1 ? 'team1' : inTeam2 ? 'team2' : null;

            // Broji golove, asistencije i autogolove iz stats niza
            const goals = match.stats?.filter(s => (s.player?._id || s.player)?.toString() === id.toString() && s.stats === 'goal').length || 0;
            const assists = match.stats?.filter(s => (s.player?._id || s.player)?.toString() === id.toString() && s.stats === 'assist').length || 0;
            const ownGoals = match.stats?.filter(s => (s.player?._id || s.player)?.toString() === id.toString() && s.stats === 'ownGoal').length || 0;

            initial[id] = { team, goals, assists, ownGoals };
        });
        setPlayerData(initial);
        setShowModal(true);
    };

    // Cuvanje statistike
    const handleSaveStats = async () => {
        const team1 = [];
        const team2 = [];
        const stats = [];

      

        Object.entries(playerData).forEach(([playerId, pd]) => {
            if (pd.team === 'team1') team1.push(playerId);
            else if (pd.team === 'team2') team2.push(playerId);

            if(pd.team !== null) {
                for(let i=0; i<pd.goals; i++) {
                    stats.push({ player: playerId, stats: 'goal' });
                }
                for(let i=0; i<pd.assists; i++) {
                    stats.push({ player: playerId, stats: 'assist' });
                }
                for(let i=0; i<pd.ownGoals; i++) {
                    stats.push({ player: playerId, stats: 'ownGoal' });
                }
            }
        });

        if (team1.length !== 6 || team2.length !== 6) {
            setError("Svaki tim mora imati tačno 6 igrača!");
            return;
        }

        try {
            await axios.put(`/api/matches/${selectedMatch._id}`, {
                team1,
                team2,
                stats,
                status: 'finished'
            },{headers: { Authorization: `Bearer ${token}` }});
            setMessage("Termin je uspešno ažuriran!");
            setShowModal(false);
            fetchMatches();
            setError("");
        }
        catch (error) {
            setError("Greška prilikom ažuriranja termina.");
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Upravljanje Terminima</h2>
            {message && <p className="mb-4 text-green-600 font-semibold">{message}</p>}
            {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}
            {/* Forma za kreiranje termina */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">Kreiraj novi termin</h3>
                <form onSubmit={handleCreateMatch}>
                    {/* Forma za unos podataka o terminu */}
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="number"
                            placeholder="Sezona (npr. 2026)"
                            value={season}
                            onChange={(e) => setSeason(e.target.value)}
                            className="border border-gray-300 p-2 rounded"
                            min="1000"
                            max="9999"
                            required
                        />
                        {/*<input
                            type="number"
                            placeholder="Broj termina"
                            value={matchNumber}
                            onChange={(e) => setMatchNumber(e.target.value)}
                            className="border border-gray-300 p-2 rounded"
                            min="1"
                            required
                        />*/}
                        {/*<input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-gray-300 p-2 rounded"
                            required
                        />*/}
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-gray-300 p-2 rounded"
                            required
                        />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="border border-gray-300 p-2 rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-500 text-white p-2 rounded"
                    >
                        Kreiraj termin
                    </button>
                </form>
            </div>
            {/* Lista termina */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Postojeći termini</h3>
                {matches.length === 0 ? (
                    <p className="text-gray-600">Nema kreiranih termina.</p>
                ) : (
                    <table className="w-full">
                        <thead className="bg-green-600 text-white">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Sezona</th>
                                <th className="p-3 text-left">Broj termina</th>
                                <th className="p-3 text-left">Datum</th>
                                <th className="p-3 text-left">Rok za prijavu</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match, index) => (
                                <tr key={match._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{match.season}</td>
                                    <td className="p-3">{match.matchNumber}</td>
                                    <td className="p-3">{new Date(match.date).toLocaleString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false})}</td>
                                    <td className="p-3">{new Date(match.registrationDeadline).toLocaleString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded text-white text-sm ${
                                            match.status === 'open' ? 'bg-green-500' :
                                            match.status === 'closed' ? 'bg-blue-500' : 'bg-gray-500'
                                        }`}>{match.status === 'open' ? 'Otvoren' : match.status === 'closed' ? 'Zatvoren' : 'Završen'}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                        {match.status === 'open' && (
                                            <button onClick={() => handleUpdateMatch(match._id, 'closed')} className="bg-blue-500 text-white px-2 py-1 rounded">
                                                Zatvori
                                            </button>
                                        )}
                                        {match.status === 'closed' && (
                                            <>
                                            <button onClick={() => handleUpdateMatch(match._id, 'open')} className="bg-green-500 text-white px-2 py-1 rounded">
                                                Otvori
                                            </button>
                                            <button onClick={() => handleOpenModal(match, 'edit')} className="bg-yellow-500 text-white px-2 py-1 rounded">
                                                Unesi statistiku
                                            </button>
                                            </>
                                        )}
                                        {match.status === 'finished' && (
                                            <>
                                            <button onClick={() => handleOpenModal(match, 'view')} className="bg-gray-500 text-white px-2 py-1 rounded">
                                                Pregledaj
                                            </button>
                                            <button onClick={() => handleOpenModal(match, 'edit')} className="bg-yellow-500 text-white px-2 py-1 rounded">
                                                Ažuriraj
                                            </button>
                                            </>
                                        )}

                                        <button onClick={() => handleDeleteMatch(match._id)} className="bg-red-500 text-white px-2 py-1 rounded">
                                            Obriši
                                        </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {showModal && selectedMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-3/4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{modalMode === 'edit' ? 'Unesi statistiku' : 'Pregled termina'}: {new Date(selectedMatch.date).toLocaleString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                        </div>
                        {selectedMatch.status === 'finished' && (() => {
                            const goalsTeam1 = (selectedMatch.stats?.filter(s => selectedMatch.team1?.some(t => (t._id || t).toString() === (s.player?._id || s.player)?.toString()) && s.stats === 'goal').length || 0) + 
                                               (selectedMatch.stats?.filter(s => selectedMatch.team2?.some(t => (t._id || t).toString() === (s.player?._id || s.player)?.toString()) && s.stats === 'ownGoal').length || 0);
                            const goalsTeam2 = (selectedMatch.stats?.filter(s => selectedMatch.team2?.some(t => (t._id || t).toString() === (s.player?._id || s.player)?.toString()) && s.stats === 'goal').length || 0) + 
                                               (selectedMatch.stats?.filter(s => selectedMatch.team1?.some(t => (t._id || t).toString() === (s.player?._id || s.player)?.toString()) && s.stats === 'ownGoal').length || 0);
                            return (
                                <div className="text-center text-3xl font-bold mb-4 text-gray-600">
                                    Tim 1 <span className="text-gray-600">{goalsTeam1}</span> : <span className="text-gray-600">{goalsTeam2}</span> Tim 2
                                </div>
                            );
                        })()}
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Ime</th>
                                    <th className="p-2 text-center">Tim 1</th>
                                    <th className="p-2 text-center">Tim 2</th>
                                    <th className="p-2 text-center">/</th>
                                    <th className="p-2 text-center">Gol</th>
                                    <th className="p-2 text-center">Asistencija</th>
                                    <th className="p-2 text-center">Autogol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map(p => {
                                    const pd = playerData[p._id] || { team: null, goals: 0, assists: 0, ownGoals: 0 };
                                    const inTeam = pd.team !== null;
                                    return (
                                        <tr key={p._id} className="border-b">
                                            <td className="p-2">{p.nickname}</td>
                                            <td className="p-2 text-center">
                                                <input type="radio" name={`team-${p._id}`} checked={pd.team === 'team1'} disabled={modalMode === 'view'} onChange={() => setPlayerData({...playerData, [p._id]: {...pd, team: 'team1'}})} />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input type="radio" name={`team-${p._id}`} checked={pd.team === 'team2'} disabled={modalMode === 'view'} onChange={() => setPlayerData({...playerData, [p._id]: {...pd, team: 'team2'}})} />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input type="radio" name={`team-${p._id}`} checked={pd.team === null} disabled={modalMode === 'view'} onChange={() => setPlayerData({...playerData, [p._id]: {...pd, team: null, goals: 0, assists: 0, ownGoals: 0}})} />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input type="number" min="0" value={pd.goals} disabled={!inTeam || modalMode === 'view'} onChange={(e) => setPlayerData({...playerData, [p._id]: {...pd, goals: Number(e.target.value)}})} className="w-12 border rounded text-center disabled:bg-gray-100" />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input type="number" min="0" value={pd.assists} disabled={!inTeam || modalMode === 'view'} onChange={(e) => setPlayerData({...playerData, [p._id]: {...pd, assists: Number(e.target.value)}})} className="w-12 border rounded text-center disabled:bg-gray-100" />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input type="number" min="0" value={pd.ownGoals} disabled={!inTeam || modalMode === 'view'} onChange={(e) => setPlayerData({...playerData, [p._id]: {...pd, ownGoals: Number(e.target.value)}})} className="w-12 border rounded text-center disabled:bg-gray-100" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {modalMode === 'edit' && (
                            <div>
                                {error && <p className="mt-3 text-red-600 font-semibold">{error}</p>}
                                {message && <p className="mt-3 text-green-600 font-semibold">{message}</p>}
                                <button onClick={handleSaveStats} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Sačuvaj</button>
                            </div>
                        )}
                        {modalMode === 'view' && (
                            <button onClick={() => setShowModal(false)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Zatvori</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

}

export default MatchAdminPage;