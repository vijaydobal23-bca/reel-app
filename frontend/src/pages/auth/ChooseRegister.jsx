import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth-shared.css";
import {
  PARTNER_REGISTRATION_KEY,
  PARTNER_REGISTRATION_STORAGE_KEY
} from "../../constants/partnerRegistration";

const ChooseRegister = () => {
  const navigate = useNavigate();
  const [partnerKeyInput, setPartnerKeyInput] = useState("");
  const [partnerKeyError, setPartnerKeyError] = useState("");

  const unlockPartnerRegister = (e) => {
    e.preventDefault();
    const enteredKey = partnerKeyInput.trim();

    if (enteredKey !== PARTNER_REGISTRATION_KEY) {
      setPartnerKeyError("Invalid secret key. Only approved partners can register.");
      return;
    }

    window.sessionStorage.setItem(PARTNER_REGISTRATION_STORAGE_KEY, enteredKey);
    setPartnerKeyError("");
    navigate("/food-partner/register");
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="choose-register-title">
        <header>
          <h1 id="choose-register-title" className="auth-title">Register</h1>
          <p className="auth-subtitle">Pick how you want to join the platform.</p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link to="/user/register" className="auth-submit" style={{ textDecoration: "none" }}>
            Register as normal user
          </Link>

          <form className="auth-form gap-sm" onSubmit={unlockPartnerRegister} noValidate>
            <div className="field-group">
              <label htmlFor="partnerSecretKey">Food Partner Secret Key</label>
              <input
                id="partnerSecretKey"
                type="password"
                value={partnerKeyInput}
                onChange={(e) => {
                  setPartnerKeyInput(e.target.value);
                  setPartnerKeyError("");
                }}
                placeholder="Enter secret key (1234)"
                required
              />
            </div>
            {partnerKeyError && <p className="small-note" style={{ color: "#b3261e" }}>{partnerKeyError}</p>}
            <button
              className="auth-submit"
              type="submit"
              style={{ background: "var(--color-surface-alt)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
            >
              Register as food partner
            </button>
          </form>
        </div>

        <div className="auth-alt-action" style={{ marginTop: "4px" }}>
          Already have an account? <Link to="/user/login">User sign in</Link> {" | "} <Link to="/food-partner/login">Partner sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
