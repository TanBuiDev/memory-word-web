import type { User } from "firebase/auth";
import { create } from 'zustand';
import { auth } from '../firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

// Zustand tạo store bằng cách truyền vào một hàm factory nhận set và trả về một object chứa state và actions.
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    
    signOut: async () => {
        await firebaseSignOut(auth);
        set({ user: null });
    },
}));