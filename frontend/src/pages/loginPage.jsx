import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginUser() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null); 
    const [success, setSuccess] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        try {
            const response = await axios.post("/api/auth/login", {
                email: email,
                password: password
            });
            console.log(response.data);
            localStorage.setItem("token", response.data.token);
            setSuccess(true);
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setError("Pogrešni kredencijali");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            {success && <p className="text-green-600 font-bold text-center mb-2">✅ Uspešna prijava! Preusmeravanje...</p>}
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Lozinka" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Prijava</button>
        </form>
    );
}

export default LoginUser;