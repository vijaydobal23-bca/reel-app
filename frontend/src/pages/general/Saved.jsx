import React, { useEffect, useState } from "react";
import "../../styles/reels.css";
import ReelFeed from "../../components/ReelFeed";
import api from "../../lib/api";

const Saved = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const response = await api.get("/food/save");
                const savedFoods = (response.data.savedFoods || []).map((entry) => ({
                    _id: entry.food._id,
                    video: entry.food.video,
                    description: entry.food.description,
                    likeCount: entry.food.likeCount,
                    savesCount: entry.food.savesCount,
                    foodPartner: entry.food.foodPartner,
                    isSaved: true
                }));
                setVideos(savedFoods);
            } catch (err) {
                setError(err?.response?.data?.message || "Unable to load saved videos.");
            } finally {
                setLoading(false);
            }
        };

        fetchSaved();
    }, []);

    const removeSaved = async (item) => {
        try {
            const response = await api.post("/food/save", { foodId: item._id });
            if (response.data.action === "unsaved") {
                setVideos((prev) => prev.filter((video) => video._id !== item._id));
            }
        } catch {
            // no-op
        }
    };

    if (loading) {
        return (
            <div className="reels-page">
                <div className="empty-state"><p>Loading saved videos...</p></div>
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
            onSave={removeSaved}
            emptyMessage="No saved videos yet."
        />
    );
};

export default Saved;
