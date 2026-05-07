import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth-shared.css";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const UserLogin = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        try {
            const response = await api.post("/auth/user/login", {
                email,
                password
            });

            loginUser(response.data.user);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to sign in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="user-login-title">
                <header>
                    <h1 id="user-login-title" className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to continue your food journey.</p>
                </header>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="Your password" autoComplete="current-password" required />
                    </div>

                    {error && <p className="small-note" style={{ color: "#b3261e" }}>{error}</p>}

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New here? <Link to="/user/register">Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
