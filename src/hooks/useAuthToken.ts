import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onIdTokenChanged, User } from 'firebase/auth';

export function useAuthToken() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    setToken(idToken);
                } catch (e) {
                    console.error("Failed to get ID token", e);
                    setToken(null);
                }
            } else {
                setToken(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshToken = async () => {
        if (auth.currentUser) {
            try {
                const idToken = await auth.currentUser.getIdToken(true);
                setToken(idToken);
                return idToken;
            } catch (e) {
                console.error("Failed to refresh token", e);
                return null;
            }
        }
        return null;
    };

    return { token, loading, refreshToken };
}
