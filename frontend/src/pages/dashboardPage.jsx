import { useState, useEffect } from "react";    
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import axios from "axios";

function DashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();   
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Provera da li je korisnik autentifikovan
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
        const fetchUser = async () => {
            try {
                console.log('Saljem request na /api/auth/me');
                const response = await axios.get("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
                console.log('USER DATA:', response.data);
                console.log('ROLE:', response.data.role);
            } catch (error) {
                console.error("Greška prilikom dohvatanja korisničkih podataka:", error);
                localStorage.removeItem("token");
                navigate("/");
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    }

    const navigateItems =[
        {label: "Naslovna", path: "/dashboard"},
        {label: "Fantasy Tim", path: "/dashboard/fantasy-team"},
        {label: "Tabela", path: "/dashboard/leaderboard"},
        {label: "Statistika", path: "/dashboard/statistics"},
        {label: "Rezultati", path: "/dashboard/results"},
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header sa logout */}
            <div className="bg-green-700 p-4 flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold"> Football Fantasy</h1>
                <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                    Logout
                </button>
            </div>

            {/* NAVIGACIJA */}
            <nav className="bg-green-600 shadow-md">
                <div className="flex">
                    {navigateItems.map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`px-6 py-4 text-white font-semibold hover:bg-green-700 transition uppercase ${
                                location.pathname === item.path ? "bg-green-700 border-b-4 border-white" : ""
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    {userData?.role === 'admin' && (
                        <button
                            onClick={() => navigate("/dashboard/admin")}
                            className={`px-6 py-4 text-white font-semibold hover:bg-green-700 transition uppercase ${
                                location.pathname === "/dashboard/admin" ? "bg-green-700 border-b-4 border-white" : ""
                            }`}
                        >
                            Admin
                        </button>
                    )}
                </div>
            </nav>

            {/* SADRŽAJ */}
            <div>
                <Outlet context={{ userData }} />
            </div>
        </div>
    );
}

export default DashboardPage;