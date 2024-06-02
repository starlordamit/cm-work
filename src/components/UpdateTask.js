import React, { useState } from 'react';
import { db } from '../firebase';

const UpdateTask = ({ task }) => {
    const [status, setStatus] = useState(task.status);

    const handleUpdateTask = async () => {
        try {
            await db.collection('tasks').doc(task.id).update({ status });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <div>
            <h2>Update Task</h2>
            <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" />
            <button onClick={handleUpdateTask}>Update</button>
        </div>
    );
};

export default UpdateTask;
