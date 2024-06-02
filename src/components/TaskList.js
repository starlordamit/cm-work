import React, { useState, useEffect } from 'react';
import { db } from '../firebase';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('tasks').onSnapshot((snapshot) => {
            const tasksData = [];
            snapshot.forEach((doc) => tasksData.push({ ...doc.data(), id: doc.id }));
            setTasks(tasksData);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <h2>Task List</h2>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.description} - {task.status} - {task.assignedTo}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
