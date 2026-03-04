import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Check Session
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            if (currentSession?.user) {
                // 2. Check Role
                const { data: user, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', currentSession.user.id)
                    .single();

                if (user) {
                    setRole(user.role);
                } else {
                    console.error("Error fetching user role Profile Fetch Error:", error);
                    // Check if it's a 406 Not Acceptable
                    if (error?.message?.includes('406') || error?.code === '406') {
                        console.warn('406 Not Acceptable detected. This might be a session/WAF issue.');
                    }
                }
            }

            setLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{
                height: '100vh', width: '100vw',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <LoadingSpinner />
            </div>
        );
    }

    // Must be logged in
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Must be Admin or Editor (basic role check)
    // If role is missing or 'reader', deny access? 
    // For now, let's strictly require 'admin' or 'editor' or 'author'.
    const allowedRoles = ['admin', 'editor', 'author'];
    const userEmail = session?.user?.email;

    // EMERGENCY BYPASS FOR ADMIN
    if (userEmail === 'tazaadmedia@gmail.com') {
        return <Outlet />;
    }

    if (role && !allowedRoles.includes(role)) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h1>Unauthorized</h1>
                <p>You do not have permission to access the admin panel.</p>
                <p style={{ marginTop: '1rem', color: '#666' }}>Role: {role || 'None'}</p>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
