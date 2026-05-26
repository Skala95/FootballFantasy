import { useState, useEffect } from "react";    
import axios from "axios";
import MatchAdminPage from "./matchAdminPage";

function AdminPage() {
    const [players, setPlayers] = useState([]);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [nickname, setNickname] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPlayer, setEditPlayer] = useState(null);
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editNickname, setEditNickname] = useState("");

    const token = localStorage.getItem("token");

    // Dohvata sve igrace
    const fetchPlayers = async () => {
        try {
            const response = await axios.get("/api/players");
            setPlayers(response.data);
        } catch (error) {
            console.error("Greska pri dohvatanju igraca:", error);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    // Dodavanje novog igraca
    const handleAddPlayer = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/players", 
                { firstName, lastName, nickname }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setMessage("Igrač je uspešno dodat.");
            setFirstName("");
            setLastName("");
            setNickname("");   
            fetchPlayers();
            setError("");
        } catch (error) {
            console.error("Greska pri dodavanju igraca:", error);
            setError("Greška pri dodavanju igrača.");
        }
    };

    // Brisanje igraca
    const handleDeletePlayer = async (id) => {
        try {
            await axios.delete(`/api/players/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage("Igrač je uspesno obrisan.");
            fetchPlayers();
        } catch (error) {
            console.error("Greska pri brisanju igraca:", error);
            setMessage("Greska pri brisanju igraca.");
        }
    };

    // Editovanje igraca
    const handleEditPlayer = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/players/${editPlayer._id}`,
                { firstName: editFirstName, lastName: editLastName, nickname: editNickname }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setMessage("Igrač je uspešno izmenjen.");
            setEditPlayer(null);
            setShowEditModal(false);
            fetchPlayers();
            setError("");
        } catch (error) {
            console.error("Greška pri izmeni igrača:", error);
            setError("Greška pri izmeni igrača.");
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            {/* Forma za dodavanje */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Dodaj igrača</h3>
                {message && <p className="text-green-600 mb-4">{message}</p>}
                {error && <p className="text-red-600 mb-4">{error}</p>}
                <form onSubmit={handleAddPlayer} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Ime"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Prezime"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nadimak"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        Dodaj
                    </button>                    
                </form>
            </div>
            {/* Dugme za brisanje */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Brisanje igrača</h3>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                >
                    Obriši igrača
                </button>
            </div>

            {/* Modal za brisanje */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Izaberi igrača za brisanje</h3>
                        
                        <div className="overflow-y-auto flex-1 mb-4">
                            {players.map((player) => (
                                <div
                                    key={player._id}
                                    onClick={() => setSelectedPlayer(player)}
                                    className={`p-3 cursor-pointer rounded mb-2 border ${
                                        selectedPlayer?._id === player._id 
                                        ? 'bg-green-100 border-green-500' 
                                        : 'hover:bg-gray-100 border-gray-200'
                                    }`}
                                >
                                    {player.firstName} {player.lastName} ({player.nickname})
                                </div>
                            ))}
                        </div>

                        {selectedPlayer && (
                            <p className="text-red-600 font-semibold mb-4">
                                Da li si siguran da želiš obrisati {selectedPlayer.nickname}?
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setSelectedPlayer(null); }}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded w-full"
                            >
                                Otkaži
                            </button>
                            <button
                                onClick={() => { handleDeletePlayer(selectedPlayer._id); setShowDeleteModal(false); setSelectedPlayer(null); }}
                                disabled={!selectedPlayer}
                                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                            >
                                Obriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Dugme za azuriranje */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Ažuriranje igrača</h3>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                >
                    Ažuriraj igrača
                </button>
            </div>
            {/* Modal za azuriranje */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Izaberi igrača za ažuriranje</h3>

                        {!editPlayer ? (
                            <div className="overflow-y-auto flex-1 mb-4">
                                {players.map((player) => (
                                    <div
                                        key={player._id}
                                        onClick={() => {
                                            setEditPlayer(player);
                                            setEditFirstName(player.firstName);
                                            setEditLastName(player.lastName);
                                            setEditNickname(player.nickname);
                                        }}
                                        className="p-3 cursor-pointer rounded mb-2 border hover:bg-gray-100 border-gray-200"
                                    >
                                        {player.firstName} {player.lastName} ({player.nickname})
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleEditPlayer} className="flex flex-col gap-3 mb-4">
                                <input
                                    type="text"
                                    value={editFirstName}
                                    onChange={(e) => setEditFirstName(e.target.value)}
                                    className="border rounded px-3 py-2"
                                    placeholder="Ime"
                                    required
                                />
                                <input
                                    type="text"
                                    value={editLastName}
                                    onChange={(e) => setEditLastName(e.target.value)}
                                    className="border rounded px-3 py-2"
                                    placeholder="Prezime"
                                    required
                                />
                                <input
                                    type="text"
                                    value={editNickname}
                                    onChange={(e) => setEditNickname(e.target.value)}
                                    className="border rounded px-3 py-2"
                                    placeholder="Nadimak"
                                    required
                                />
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                                    Sačuvaj
                                </button>
                            </form>
                        )}

                        <button
                            onClick={() => { setShowEditModal(false); setEditPlayer(null); }}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded w-full"
                        >
                            Otkaži
                        </button>
                    </div>
                </div>
            )}
            <MatchAdminPage /> 
        </div>
    );
}

export default AdminPage;