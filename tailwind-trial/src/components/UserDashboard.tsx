import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/auth";
import {
  ArrowLeft,
  MapPin,
  Crown,
  CreditCard,
  User,
  Package,
} from "lucide-react";

// Import types from auth service
import type {
  Package as PackageType,
  PaymentHistory,
  DashboardStats as AuthDashboardStats,
} from "../services/auth";

interface User {
  id: string;
  username: string;
  email: string;
  is_paid_user: boolean;
  is_package_active: boolean;
  days_remaining: number;
  created_at: string;
  current_package?: PackageType;
}

type TabType = "overview" | "packages" | "payments";

function UserDashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<AuthDashboardStats | null>(
    null
  );
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [upgrading, setUpgrading] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      const [dashboard, packagesData, payments] = await Promise.all([
        authService.getDashboardStats(),
        authService.getPackages(),
        authService.getPaymentHistory(),
      ]);

      setDashboardData(dashboard);
      setPackages(packagesData);
      setPaymentHistory(payments);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (packageId: number): Promise<void> => {
    setUpgrading(packageId);
    try {
      const response = await authService.upgradePackage(packageId);
      if (response.payment) {
        // For demo purposes, auto-confirm payment
        if (response.payment.status === "PENDING") {
          await authService.confirmPayment(response.payment.transaction_id);
        }
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error upgrading package:", error);
    } finally {
      setUpgrading(null);
    }
  };

  const handleBackToMap = () => {
    // Navigate back to map - you can use React Router here
    window.location.href = "/map";
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPackageIcon = (packageName: string) => {
    switch (packageName?.toLowerCase()) {
      case "free":
        return <User className="w-8 h-8 text-gray-500" />;
      case "basic":
        return <Package className="w-8 h-8 text-blue-500" />;
      case "premium":
        return <Crown className="w-8 h-8 text-purple-500" />;
      case "enterprise":
        return <Crown className="w-8 h-8 text-gold-500" />;
      default:
        return <Package className="w-8 h-8 text-gray-500" />;
    }
  };

  const getPackageColor = (packageName: string) => {
    switch (packageName?.toLowerCase()) {
      case "free":
        return "border-gray-300 bg-gray-50";
      case "basic":
        return "border-blue-300 bg-blue-50";
      case "premium":
        return "border-purple-300 bg-purple-50";
      case "enterprise":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  // Calculate totals from payment history if not provided by dashboard data
  const totalSpent =
    dashboardData?.total_spent ??
    paymentHistory
      .filter(
        (payment) =>
          payment.status.toLowerCase() === "completed" ||
          payment.status.toLowerCase() === "success"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

  const totalPayments =
    dashboardData?.total_payments ??
    paymentHistory.filter(
      (payment) =>
        payment.status.toLowerCase() === "completed" ||
        payment.status.toLowerCase() === "success"
    ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToMap}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Map</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-800">
                  Mtaa Wetu Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-medium text-gray-900">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: "overview", label: "Overview", icon: User },
              { key: "packages", label: "Packages", icon: Package },
              { key: "payments", label: "Payments", icon: CreditCard },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabType)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Current Package
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {user?.current_package?.name || "None"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.is_package_active
                        ? `${user?.days_remaining} days remaining`
                        : "Expired"}
                    </p>
                  </div>
                  {user?.current_package &&
                    getPackageIcon(user.current_package.name)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Total Spent
                    </h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(totalSpent)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalPayments} payments
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Account Status
                    </h3>
                    <p
                      className={`text-2xl font-bold mt-2 ${
                        user?.is_paid_user ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {user?.is_paid_user ? "Premium" : "Free"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Member since{" "}
                      {user?.created_at ? formatDate(user.created_at) : "N/A"}
                    </p>
                  </div>
                  <Crown
                    className={`w-8 h-8 ${
                      user?.is_paid_user ? "text-yellow-500" : "text-gray-400"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab("packages")}
                  className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Upgrade Package</span>
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>View Payments</span>
                </button>
                <button
                  onClick={handleBackToMap}
                  className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View Map</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Packages
              </h2>
              <div className="text-sm text-gray-500">
                Current:{" "}
                <span className="font-medium">
                  {user?.current_package?.name || "None"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => {
                const isCurrentPackage = user?.current_package?.id === pkg.id;
                const isUpgrading = upgrading === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                      isCurrentPackage
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : getPackageColor(pkg.name)
                    } ${
                      isCurrentPackage
                        ? "transform scale-105"
                        : "hover:shadow-md"
                    }`}
                  >
                    {isCurrentPackage && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="text-center mb-6">
                        <div className="flex justify-center mb-3">
                          {getPackageIcon(pkg.name)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize">
                          {pkg.name.toLowerCase()}
                        </h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">
                            {formatCurrency(pkg.price)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            /{pkg.duration_days} days
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {pkg.features &&
                          Object.entries(pkg.features).map(
                            ([feature, value], index) => (
                              <div
                                key={index}
                                className="flex items-center text-sm"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-gray-700">
                                  {feature}: <strong>{String(value)}</strong>
                                </span>
                              </div>
                            )
                          )}
                      </div>

                      <button
                        onClick={() => handleUpgrade(pkg.id)}
                        disabled={isCurrentPackage || isUpgrading}
                        className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                          isCurrentPackage
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isUpgrading
                            ? "bg-blue-400 text-white cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105"
                        }`}
                      >
                        {isUpgrading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : isCurrentPackage ? (
                          "Current Package"
                        ) : pkg.price === 0 ? (
                          "Select Free Plan"
                        ) : (
                          `Upgrade to ${pkg.name}`
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Package Comparison Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                Need help choosing?
              </h4>
              <p className="text-blue-700">
                All paid packages include priority support and advanced map
                features. You can upgrade or downgrade at any time, and changes
                take effect immediately.
              </p>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Payment History
              </h2>
              <div className="text-sm text-gray-500">
                Total: {formatCurrency(totalSpent)} ({totalPayments} payments)
              </div>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payments yet
                </h3>
                <p className="text-gray-500 mb-6">
                  When you upgrade to a paid package, your payment history will
                  appear here.
                </p>
                <button
                  onClick={() => setActiveTab("packages")}
                  className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
                >
                  View Packages
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            #{payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              {getPackageIcon(payment.package_name || "")}
                              <span className="capitalize">
                                {payment.package_name?.toLowerCase() || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(payment.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span>{payment.payment_method}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
