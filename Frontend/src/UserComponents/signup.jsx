import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import "../styles/User.css";

const Signup = () => {

    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const signup = async(e) => {
        e.preventDefault();
        if(password != confirmPassword) {
            return console.log("Error!!");
        }
        const response = await fetch("http://localhost:5000/user/sign-up", {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                userName,
                email,
                password
            })
        })

        const data = await response.json();
        if(response.ok) {
            navigate('/sign-in')
        } else {
            console.log("Error")
        }
    }


    return (
        <div className='body'>
            <div className='main-container'>
                <form className='form-container'>
                    <input className='name' type='text' placeholder='Username' value={userName} onChange={(e) => setUserName(e.target.value)} required></input>
                    <input className='mail' type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required></input>
                    <input className='password' type='text' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                    <input className='c-password' type='text' placeholder='Confirm password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required></input>
                    <button className='submit' type='submit' onClick={signup}>Sign-Up</button>
                    <p>Already have an <Link to="/sign-in">account</Link>?</p>
                </form>
            </div>
        </div>

    );
}

export default Signup;
