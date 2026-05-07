import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth-shared.css";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
    PARTNER_REGISTRATION_STORAGE_KEY
} from "../../constants/partnerRegistration";

const FoodPartnerRegister = () => {
    const navigate = useNavigate();
    const { loginFoodPartner } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [partnerKey, setPartnerKey] = useState(
        () => window.sessionStorage.getItem(PARTNER_REGISTRATION_STORAGE_KEY) || ""
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const normalizedPartnerKey = partnerKey.trim();
        if (!normalizedPartnerKey) {
            setError("Secret key is required for food partner registration.");
            setSubmitting(false);
            return;
        }
        window.sessionStorage.setItem(PARTNER_REGISTRATION_STORAGE_KEY, normalizedPartnerKey);

        const businessName = e.target.businessName.value.trim();
        const contactName = e.target.contactName.value.trim();
        const phone = e.target.phone.value.trim();
        const email = e.target.email.value.trim();
        const password = e.target.password.value;
        const address = e.target.address.value.trim();

        try {
            const response = await api.post("/auth/food-partner/register", {
                name: businessName,
                contactName,
                phone,
                email,
                password,
                address,
                partnerKey: normalizedPartnerKey
            });

            loginFoodPartner(response.data.foodPartner);
            window.sessionStorage.removeItem(PARTNER_REGISTRATION_STORAGE_KEY);
            navigate("/create-food");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                (err?.request
                    ? "Cannot reach backend. Start Backend2 server on http://localhost:3000."
                    : "Unable to create partner account.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="partner-register-title">
                <header>
                    <h1 id="partner-register-title" className="auth-title">Partner sign up</h1>
                    <p className="auth-subtitle">Grow your business with our platform.</p>
                </header>

                <nav className="auth-alt-action" style={{ marginTop: "-4px" }}>
                    <strong style={{ fontWeight: 600 }}>Switch:</strong>{" "}
                    <Link to="/user/register">User</Link> {" | "} <Link to="/food-partner/register">Food partner</Link>
                </nav>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="businessName">Business Name</label>
                        <input id="businessName" name="businessName" placeholder="Tasty Bites" autoComplete="organization" required />
                    </div>

                    <div className="two-col">
                        <div className="field-group">
                            <label htmlFor="contactName">Contact Name</label>
                            <input id="contactName" name="contactName" placeholder="Jane Doe" autoComplete="name" required />
                        </div>

                        <div className="field-group">
                            <label htmlFor="phone">Phone</label>
                            <input id="phone" name="phone" placeholder="+1 555 123 4567" autoComplete="tel" required />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" required />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="Minimum 6 characters" autoComplete="new-password" minLength={6} required />
                    </div>

                    <div className="field-group">
                        <label htmlFor="address">Address</label>
                        <input id="address" name="address" placeholder="123 Market Street" autoComplete="street-address" required />
                        <p className="small-note">Full address helps customers find you faster.</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="partnerKey">Partner Secret Key</label>
                        <input
                            id="partnerKey"
                            name="partnerKey"
                            type="password"
                            value={partnerKey}
                            onChange={(e) => setPartnerKey(e.target.value)}
                            placeholder="Enter secret key (1234)"
                            required
                        />
                    </div>

                    {error && <p className="small-note" style={{ color: "#b3261e" }}>{error}</p>}

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Creating..." : "Create Partner Account"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    Already a partner? <Link to="/food-partner/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default FoodPartnerRegister;
