import React, { useState, useEffect } from 'react';
import { db } from '../firebase';

const VideoList = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('videos').onSnapshot((snapshot) => {
            const videosData = [];
            snapshot.forEach((doc) => videosData.push({ ...doc.data(), id: doc.id }));
            setVideos(videosData);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <h2>Video List</h2>
            <ul>
                {videos.map((video) => (
                    <li key={video.id}>
                        {video.title} - {video.creator} - {video.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VideoList;
