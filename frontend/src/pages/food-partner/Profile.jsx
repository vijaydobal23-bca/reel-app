import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/profile.css";
import api from "../../lib/api";

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get(`/food-partner/${id}`);
                setProfile(response.data.foodPartner || null);
                setVideos(response.data.foodPartner?.foodItems || []);
            } catch (err) {
                setError(err?.response?.data?.message || "Unable to load profile.");
            }
        };

        loadProfile();
    }, [id]);

    if (error) {
        return (
            <main className="profile-page">
                <section className="profile-header">
                    <p>{error}</p>
                </section>
            </main>
        );
    }

    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-meta">
                    <img
                        className="profile-avatar"
                        src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60"
                        alt=""
                    />

                    <div className="profile-info">
                        <h1 className="profile-pill profile-business" title="Business name">
                            {profile?.name || "Food Partner"}
                        </h1>
                        <p className="profile-pill profile-address" title="Address">
                            {profile?.address || "-"}
                        </p>
                    </div>
                </div>

                <div className="profile-stats" role="list" aria-label="Stats">
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total meals</span>
                        <span className="profile-stat-value">{profile?.totalMeals ?? 0}</span>
                    </div>
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">customer served</span>
                        <span className="profile-stat-value">{profile?.customersServed ?? 0}</span>
                    </div>
                </div>
            </section>

            <hr className="profile-sep" />

            <section className="profile-grid" aria-label="Videos">
                {videos.map((video) => (
                    <div key={video._id} className="profile-grid-item">
                        <video
                            className="profile-grid-video"
                            style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            src={video.video}
                            muted
                            playsInline
                            loop
                            controls
                        />
                    </div>
                ))}
            </section>
        </main>
    );
};

export default Profile;
