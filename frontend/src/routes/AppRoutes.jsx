import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import UserRegister from "../pages/auth/UserRegister";
import ChooseRegister from "../pages/auth/ChooseRegister";
import UserLogin from "../pages/auth/UserLogin";
import FoodPartnerRegister from "../pages/auth/FoodPartnerRegister";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin";
import Home from "../pages/general/Home";
import Saved from "../pages/general/Saved";
import BottomNav from "../components/BottomNav";
import CreateFood from "../pages/food-partner/CreateFood";
import Profile from "../pages/food-partner/Profile";
import { useAuth } from "../context/AuthContext";

const UserProtected = ({ children }) => {
    const { isUserAuthenticated, isPartnerAuthenticated } = useAuth();
    if (isUserAuthenticated) return children;
    if (isPartnerAuthenticated) return <Navigate to="/create-food" replace />;
    return <Navigate to="/user/login" replace />;
};

const PartnerProtected = ({ children }) => {
    const { isPartnerAuthenticated, isUserAuthenticated } = useAuth();
    if (isPartnerAuthenticated) return children;
    if (isUserAuthenticated) return <Navigate to="/" replace />;
    return <Navigate to="/food-partner/login" replace />;
};

const AppRoutes = () => {
    const { loading, isUserAuthenticated, isPartnerAuthenticated } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
                <p>Loading session...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/register" element={<ChooseRegister />} />

                <Route
                    path="/user/register"
                    element={isUserAuthenticated ? <Navigate to="/" replace /> : <UserRegister />}
                />
                <Route
                    path="/user/login"
                    element={isUserAuthenticated ? <Navigate to="/" replace /> : <UserLogin />}
                />

                <Route
                    path="/food-partner/register"
                    element={isPartnerAuthenticated ? <Navigate to="/create-food" replace /> : <FoodPartnerRegister />}
                />
                <Route
                    path="/food-partner/login"
                    element={isPartnerAuthenticated ? <Navigate to="/create-food" replace /> : <FoodPartnerLogin />}
                />

                <Route
                    path="/"
                    element={
                        <UserProtected>
                            <>
                                <Home />
                                <BottomNav />
                            </>
                        </UserProtected>
                    }
                />

                <Route
                    path="/saved"
                    element={
                        <UserProtected>
                            <>
                                <Saved />
                                <BottomNav />
                            </>
                        </UserProtected>
                    }
                />

                <Route
                    path="/create-food"
                    element={
                        <PartnerProtected>
                            <CreateFood />
                        </PartnerProtected>
                    }
                />

                <Route path="/food-partner/:id" element={<Profile />} />

                <Route
                    path="*"
                    element={
                        isUserAuthenticated
                            ? <Navigate to="/" replace />
                            : isPartnerAuthenticated
                                ? <Navigate to="/create-food" replace />
                                : <Navigate to="/register" replace />
                    }
                />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
