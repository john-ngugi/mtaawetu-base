// services/auth.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types and Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  package?: string;
  is_active: boolean;
  date_joined: string;
  [key: string]: any;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface DashboardStats {
  total_users?: number;
  active_packages?: number;
  revenue?: number;
  [key: string]: any;
}

export interface Package {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export interface PaymentRequest {
  package_id: number;
  payment_method: "MPESA" | "CARD" | "BANK";
}

export interface PaymentConfirmation {
  transaction_id: string;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  payment_method: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
  package_name: string;
}

export interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  // Helper method for API calls
  private async apiCall<T = any>(
    endpoint: string,
    options: ApiCallOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAccessToken();
    if (token && config.headers) {
      (
        config.headers as Record<string, string>
      ).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data: T = await response.json();

      if (!response.ok) {
        const errorData = data as any;
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // Token management
  setTokens(tokens: Partial<AuthTokens>): void {
    if (tokens.access) {
      localStorage.setItem("access_token", tokens.access);
    }
    if (tokens.refresh) {
      localStorage.setItem("refresh_token", tokens.refresh);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  // User management
  setUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Auth endpoints
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.apiCall<AuthResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.tokens) {
      this.setTokens(response.tokens);
      this.setUser(response.user);
    }

    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.apiCall<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.tokens) {
      this.setTokens(response.tokens);
      this.setUser(response.user);
    }

    return response;
  }

  async logout(): Promise<void> {
    // Optional: Call logout endpoint to invalidate tokens on server
    try {
      await this.apiCall("/auth/logout/", {
        method: "POST",
      });
    } catch (error) {
      console.warn("Logout API call failed:", error);
    }

    this.clearTokens();
  }

  // Refresh token
  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${this.baseURL}/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data: { access: string } = await response.json();

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      this.setTokens({ access: data.access });
      return data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
      throw error;
    }
  }

  // User profile endpoints
  async getUserProfile(): Promise<User> {
    const response = await this.apiCall<User>("/user/profile/");
    this.setUser(response);
    return response;
  }

  async updateProfile(
    userData: Partial<User>
  ): Promise<{ user: User; message?: string }> {
    const response = await this.apiCall<{ user: User; message?: string }>(
      "/user/update/",
      {
        method: "PUT",
        body: JSON.stringify(userData),
      }
    );

    if (response.user) {
      this.setUser(response.user);
    }

    return response;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return await this.apiCall<DashboardStats>("/user/dashboard/");
  }

  // Package management
  async getPackages(): Promise<Package[]> {
    return await this.apiCall<Package[]>("/packages/");
  }

  async upgradePackage(
    packageId: number,
    paymentMethod: "MPESA" | "CARD" | "BANK" = "MPESA"
  ): Promise<any> {
    return await this.apiCall("/packages/upgrade/", {
      method: "POST",
      body: JSON.stringify({
        package_id: packageId,
        payment_method: paymentMethod,
      }),
    });
  }

  // Payment management
  async confirmPayment(transactionId: string): Promise<any> {
    return await this.apiCall("/payments/confirm/", {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId }),
    });
  }

  async getPaymentHistory(): Promise<PaymentHistory[]> {
    return await this.apiCall<PaymentHistory[]>("/payments/history/");
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
