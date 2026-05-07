import React, { useEffect, useState } from "react";
import "../../styles/reels.css";
import ReelFeed from "../../components/ReelFeed";
import api from "../../lib/api";

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.get("/food");
                setVideos(response.data.foodItems || []);
            } catch (err) {
                setError(err?.response?.data?.message || "Unable to load videos.");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const likeVideo = async (item) => {
        try {
            const response = await api.post("/food/like", { foodId: item._id });
            const nextLikedState = response.data.action === "liked";
            const nextLikeCount = response.data.likeCount ?? item.likeCount ?? 0;

            setVideos((prev) =>
                prev.map((video) =>
                    video._id === item._id
                        ? { ...video, isLiked: nextLikedState, likeCount: nextLikeCount }
                        : video
                )
            );
        } catch {
            // no-op
        }
    };

    const saveVideo = async (item) => {
        try {
            const response = await api.post("/food/save", { foodId: item._id });
            const nextSavedState = response.data.action === "saved";
            const nextSaveCount = response.data.savesCount ?? item.savesCount ?? 0;

            setVideos((prev) =>
                prev.map((video) =>
                    video._id === item._id
                        ? { ...video, isSaved: nextSavedState, savesCount: nextSaveCount }
                        : video
                )
            );
        } catch {
            // no-op
        }
    };

    if (loading) {
        return (
            <div className="reels-page">
                <div className="empty-state"><p>Loading videos...</p></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reels-page">
                <div className="empty-state"><p>{error}</p></div>
            </div>
        );
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage="No videos available."
        />
    );
};

export default Home;
