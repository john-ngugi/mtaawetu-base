// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import authService, {
  User,
  RegisterData,
  AuthResponse,
} from "../services/auth";

// Types and Interfaces
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ user: User; message?: string }>;
  refreshUserData: () => Promise<User>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  SET_ERROR: "SET_ERROR",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
} as const;

// Action type definitions
type AuthAction =
  | { type: typeof AUTH_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof AUTH_ACTIONS.SET_USER; payload: User | null }
  | { type: typeof AUTH_ACTIONS.SET_ERROR; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user profile
          const user = await authService.getUserProfile();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Token might be expired, try to refresh
        try {
          await authService.refreshToken();
          const user = await authService.getUserProfile();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          authService.clearTokens();
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const checkTokenExpiry = () => {
      if (authService.isAuthenticated()) {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Date.now() / 1000;

            if (payload.exp && payload.exp < currentTime) {
              // Token expired, logout
              authService.clearTokens();
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } catch (error) {
            console.error("Token validation error:", error);
            authService.clearTokens();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        }
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Auth actions
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(email, password);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.register(userData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error("Logout error:", error);
      // Still log out locally even if server call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateProfile = async (
    userData: Partial<User>
  ): Promise<{ user: User; message?: string }> => {
    try {
      const response = await authService.updateProfile(userData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Profile update failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  const refreshUserData = async (): Promise<User> => {
    try {
      const user = await authService.getUserProfile();
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh user data";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  const clearError = (): void => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
