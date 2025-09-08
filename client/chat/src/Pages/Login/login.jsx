import React, { useState } from 'react'
import "./login.css"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const { email, password } = formData;
            if (email && password) {
                const res = await axios.post("http://localhost:3000/api/user/login", { email, password });
                console.log(res, "login response");
                if (res.status === 200) {
                    console.log("Login successful");
                    sessionStorage.setItem("token", res.data.jwtToken);
                    setTimeout(() => {
                        navigate("/chat");
                    }, 2000);
                }
            }
        } catch (err) {
            setError("Login failed. Please try again.");
        }

    }

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={onChange} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={onChange} />
                </div>
                <button type="submit">Login</button>
                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    )
}
