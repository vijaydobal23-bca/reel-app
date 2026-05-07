/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [foodPartner, setFoodPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(async () => {
        try {
            const response = await api.get("/auth/session");
            setUser(response.data.user || null);
            setFoodPartner(response.data.foodPartner || null);
        } catch {
            setUser(null);
            setFoodPartner(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const loginUser = useCallback((sessionUser) => {
        setUser(sessionUser || null);
        setFoodPartner(null);
    }, []);

    const loginFoodPartner = useCallback((sessionFoodPartner) => {
        setFoodPartner(sessionFoodPartner || null);
        setUser(null);
    }, []);

    const logoutUser = useCallback(async () => {
        await api.post("/auth/user/logout");
        setUser(null);
        setFoodPartner(null);
    }, []);

    const logoutFoodPartner = useCallback(async () => {
        await api.post("/auth/food-partner/logout");
        setFoodPartner(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            foodPartner,
            loading,
            isUserAuthenticated: Boolean(user),
            isPartnerAuthenticated: Boolean(foodPartner),
            refreshSession,
            loginUser,
            loginFoodPartner,
            logoutUser,
            logoutFoodPartner
        }),
        [foodPartner, loading, loginFoodPartner, loginUser, logoutFoodPartner, logoutUser, refreshSession, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};
