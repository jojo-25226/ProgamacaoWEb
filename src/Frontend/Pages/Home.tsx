import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        }
        else {
            navigate("/feed");
        }
    }, []);

    return (
        <div>
            <h1>Bem-vindo à página inicial</h1>
        </div>
    );
}