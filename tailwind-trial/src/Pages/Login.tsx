import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // Add this import
import { useLocation } from "react-router-dom"; // For redirecting after login
// Types and Interfaces
interface FormData {
  email: string;
  password: string;
  username: string;
  password_confirm: string;
  phone_number: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  password_confirm?: string;
  phone_number?: string;
  general?: string;
}

// Initial form state
const initialFormData: FormData = {
  email: "",
  password: "",
  username: "",
  password_confirm: "",
  phone_number: "",
};

function Authentication(): JSX.Element {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const { login, register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Add navigation hook

  const location = useLocation();
  const from = location.state?.from?.pathname || "/map";

  // Update the useEffect that handles redirect:
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  // // Redirect to dashboard if already authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/map", { replace: true });
  //   }
  // }, [isAuthenticated, navigate]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    // Registration-specific validation
    if (!isLogin) {
      if (!formData.username) {
        errors.username = "Username is required";
      } else if (formData.username.length < 3) {
        errors.username = "Username must be at least 3 characters long";
      }

      if (!formData.password_confirm) {
        errors.password_confirm = "Please confirm your password";
      } else if (formData.password !== formData.password_confirm) {
        errors.password_confirm = "Passwords don't match";
      }

      // Phone number validation (optional but if provided, should be valid)
      if (formData.phone_number) {
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(formData.phone_number)) {
          errors.phone_number = "Please enter a valid phone number";
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear global error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        // Redirect will happen automatically via useEffect when isAuthenticated becomes true
      } else {
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          password_confirm: formData.password_confirm,
          phone_number: formData.phone_number || undefined,
        });
        // Redirect will happen automatically via useEffect when isAuthenticated becomes true
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setValidationErrors({});
    if (error) clearError();
  };

  const handleTabSwitch = (loginMode: boolean): void => {
    setIsLogin(loginMode);
    resetForm();
  };

  // Helper function to get input error styling
  const getInputClassName = (fieldName: keyof FormData): string => {
    const baseClasses =
      "w-full px-3 py-2 mt-1 text-gray-900 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const errorClasses =
      "border-red-500 focus:ring-red-500 focus:border-red-500";

    return validationErrors[fieldName]
      ? `${baseClasses} ${errorClasses}`
      : baseClasses;
  };

  // Helper component for displaying field errors
  const FieldError: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return <p className="mt-1 text-sm text-red-600">{error}</p>;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg">
        <div className="flex w-full justify-center text-blue-800 text-3xl font-bold mb-4 font-Zaine">
          Mtaa Wetu
        </div>

        {/* Toggle Tabs */}
        <div className="flex justify-around mb-6">
          <button
            type="button"
            className={`py-2 px-4 border-b-2 transition-colors focus:outline-none ${
              isLogin
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleTabSwitch(true)}
            disabled={isSubmitting}
          >
            Login
          </button>
          <button
            type="button"
            className={`py-2 px-4 border-b-2 transition-colors focus:outline-none ${
              !isLogin
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleTabSwitch(false)}
            disabled={isSubmitting}
          >
            Register
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isLogin ? (
            // Login Form
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Login
              </h2>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getInputClassName("email")}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                <FieldError error={validationErrors.email} />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getInputClassName("password")}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <FieldError error={validationErrors.password} />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-500 hover:underline focus:outline-none focus:underline"
                  onClick={() => {
                    // TODO: Implement forgot password functionality
                    alert("Forgot password functionality coming soon!");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </>
          ) : (
            // Register Form
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Register
              </h2>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={getInputClassName("username")}
                  placeholder="Choose a username"
                  required
                  disabled={isSubmitting}
                  autoComplete="username"
                />
                <FieldError error={validationErrors.username} />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getInputClassName("email")}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                <FieldError error={validationErrors.email} />
              </div>

              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={getInputClassName("phone_number")}
                  placeholder="+254 700 000 000"
                  disabled={isSubmitting}
                  autoComplete="tel"
                />
                <FieldError error={validationErrors.phone_number} />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getInputClassName("password")}
                  placeholder="Create a password (min. 6 characters)"
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <FieldError error={validationErrors.password} />
              </div>

              <div>
                <label
                  htmlFor="password_confirm"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  className={getInputClassName("password_confirm")}
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <FieldError error={validationErrors.password_confirm} />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isLogin ? "Signing in..." : "Creating account..."}
              </div>
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600 mt-4">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className="text-blue-500 hover:underline focus:outline-none focus:underline"
                disabled={isSubmitting}
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className="text-blue-500 hover:underline focus:outline-none focus:underline"
                disabled={isSubmitting}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Authentication;
