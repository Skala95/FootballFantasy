import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterUser() {
    const navigate = useNavigate(); 
    const [userFirstName, setUserFirstName] = useState("");  
    const [userLastName, setUserLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const handleSubmit = async (e) => {
        e.preventDefault(); // Zaustavlja defaultno ponašanje forme (refresh stranice)
        setError(null);
        setSuccess(null);   
        try {
            //const response = await axios.post("http://localhost:8080/api/auth/register", {
            const response = await axios.post("/api/auth/register", {
                firstName: userFirstName,
                lastName: userLastName,
                email: email,
                password: password
            });
            console.log(response.data);
            setSuccess("Uspešno ste se registrovali!");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Došlo je do greške prilikom registracije");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
            <input type="text" placeholder="Ime" value={userFirstName} onChange={(e) => setUserFirstName(e.target.value)} />
            <input type="text" placeholder="Prezime" value={userLastName} onChange={(e) => setUserLastName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Lozinka" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Registruj se</button>
        </form>
    );  

}
export default RegisterUser;