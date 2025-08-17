import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import "../styles/User.css"

const Signin = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = async(e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/user/sign-in", {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        const data = await response.json();
        if(response.ok) {
            localStorage.setItem("userId", data.loginData._id);
            localStorage.setItem("userName", data.loginData.userName);
            localStorage.setItem("email", data.loginData.email);
            localStorage.setItem("credit", data.loginData.credit);
            navigate("/dashboard")
        }
    }

    return (
        <div className='body'>
            <div className='main-container'>
            <form className='form-container'>
                <input className='mail' type='text' placeholder='Login email' value={email} onChange={(e) => setEmail(e.target.value)}></input>
                <input className='password' type='text' placeholder='Login password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                <button className='submit' type='submit' onClick={handleSubmit}>Login</button>
                <p>Don't have an <Link to="/">account</Link>?</p>
            </form>
        </div>
        </div>

    );
}

export default Signin;
