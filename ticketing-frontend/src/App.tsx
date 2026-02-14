import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Tickets from './pages/Tickets';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/tickets" element={<Tickets />} />
        </Routes>
    );
}
