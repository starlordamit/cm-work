import React, { useState } from 'react';
import { db } from '../firebase';

const UpdateVideo = ({ video }) => {
    const [status, setStatus] = useState(video.status);

    const handleUpdateVideo = async () => {
        try {
            await db.collection('videos').doc(video.id).update({ status });
        } catch (error) {
            console.error('Error updating video:', error);
        }
    };

    return (
        <div>
            <h2>Update Video</h2>
            <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" />
            <button onClick={handleUpdateVideo}>Update</button>
        </div>
    );
};

export default UpdateVideo;
