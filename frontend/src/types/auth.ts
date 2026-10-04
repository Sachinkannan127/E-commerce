export type UserRole = "GUEST" | "CUSTOMER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  wallet_balance_paise: number;
  loyalty_points: number;
  referral_code: string;
  is_verified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}
