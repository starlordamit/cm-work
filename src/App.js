import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminDeletionRequests from './components/AdminDeletionRequests';
import Team from './components/Team';
import Profile from './components/Profile';
import AppLayout from './components/AppLayout';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';

const RequireAuth = ({ children, reverse = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Spin tip="Loading..." />;
    }

    if (reverse) {
        return user ? <Navigate to="/dashboard" /> : children;
    }

    return user ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<RequireAuth><Navigate to="/dashboard" /></RequireAuth>} />
                    <Route path="/login" element={<RequireAuth reverse><Login /></RequireAuth>} />
                    {/*<Route path="/register" element={<RequireAuth reverse><Register /></RequireAuth>} />*/}
                    <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
                    <Route path="/deletion-requests" element={<PrivateRoute><AppLayout><AdminDeletionRequests /></AppLayout></PrivateRoute>} />
                    <Route path="/team" element={<PrivateRoute adminOnly><AppLayout><Team /></AppLayout></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
                    {/*<Route path="/user-approvals" element={<PrivateRoute adminOnly><AppLayout><AdminUserApproval /></AppLayout></PrivateRoute>}/>*/}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
