import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
	user: User | null;
	token: string | null;
	isHydrated: boolean;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isHydrated: false,
			setAuth: (user, token) => set({ user, token }),
			logout: () => set({ user: null, token: null }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.isHydrated = true;
				}
			},
		}
	)
);