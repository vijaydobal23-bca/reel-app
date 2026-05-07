import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth-shared.css";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const FoodPartnerLogin = () => {
    const navigate = useNavigate();
    const { loginFoodPartner } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        try {
            const response = await api.post("/auth/food-partner/login", {
                email,
                password
            });

            loginFoodPartner(response.data.foodPartner);
            navigate("/create-food");
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to sign in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="partner-login-title">
                <header>
                    <h1 id="partner-login-title" className="auth-title">Partner login</h1>
                    <p className="auth-subtitle">Access your dashboard and upload food videos.</p>
                </header>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" required />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
                    </div>

                    {error && <p className="small-note" style={{ color: "#b3261e" }}>{error}</p>}

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New partner? <Link to="/food-partner/register">Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default FoodPartnerLogin;
