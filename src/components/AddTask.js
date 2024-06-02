import React, { useState } from 'react';
import { db } from '../firebase';

const AddTask = () => {
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await db.collection('tasks').add({
                description,
                status: 'pending',
                assignedTo,
            });
            setDescription('');
            setAssignedTo('');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    return (
        <div>
            <h2>Add Task</h2>
            <form onSubmit={handleAddTask}>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Assigned To" />
                <button type="submit">Add Task</button>
            </form>
        </div>
    );
};

export default AddTask;
