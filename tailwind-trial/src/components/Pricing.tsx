import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  StarIcon,
  UserIcon,
  BuildingOfficeIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { Crown, Package } from "lucide-react";
import authService from "../services/auth";
import type { Package as PackageType } from "../services/auth";

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transform transition-all duration-1000 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {children}
    </div>
  );
};

const getPackageIcon = (packageName: string) => {
  switch (packageName?.toLowerCase()) {
    case "free":
      return UserIcon;
    case "basic":
      return BuildingOfficeIcon;
    case "premium":
      return Crown;
    case "enterprise":
      return StarIcon;
    default:
      return Package;
  }
};

const getPackageGradient = (packageName: string) => {
  switch (packageName?.toLowerCase()) {
    case "free":
      return "from-gray-400 to-gray-600";
    case "basic":
      return "from-blue-500 to-cyan-500";
    case "premium":
      return "from-purple-500 to-pink-500";
    case "enterprise":
      return "from-yellow-400 to-orange-500";
    default:
      return "from-gray-400 to-gray-600";
  }
};

const getPackageColor = (packageName: string) => {
  switch (packageName?.toLowerCase()) {
    case "free":
      return "gray";
    case "basic":
      return "blue";
    case "premium":
      return "purple";
    case "enterprise":
      return "yellow";
    default:
      return "gray";
  }
};

const getPackageDescription = (packageName: string) => {
  switch (packageName?.toLowerCase()) {
    case "free":
      return "Perfect for getting started with basic neighborhood insights";
    case "basic":
      return "Great for residents who want enhanced neighborhood data";
    case "premium":
      return "Perfect for power users and local organizations";
    case "enterprise":
      return "Built for organizations and government agencies";
    default:
      return "Comprehensive package for your needs";
  }
};

const isPopularPackage = (packageName: string) => {
  return packageName?.toLowerCase() === "premium";
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

// Convert package features object to array of strings
const formatFeatures = (features: any): string[] => {
  if (!features || typeof features !== "object") {
    return ["Access to platform features"];
  }

  return Object.entries(features).map(([key, value]) => {
    if (typeof value === "boolean") {
      return value
        ? key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : `No ${key.replace(/_/g, " ")}`;
    }
    return `${key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())}: ${value}`;
  });
};

export default function PricingComponent() {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [upgrading, setUpgrading] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async (): Promise<void> => {
    try {
      setLoading(true);
      const packagesData = await authService.getPackages();
      setPackages(packagesData);
      setError(null);
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load pricing packages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = async (packageId: number): Promise<void> => {
    setUpgrading(packageId);
    try {
      const response = await authService.upgradePackage(packageId);
      if (response.payment) {
        // For demo purposes, auto-confirm payment
        if (response.payment.status === "PENDING") {
          await authService.confirmPayment(response.payment.transaction_id);
        }
        // You might want to show a success message or redirect here
        console.log("Package upgraded successfully!");
      }
    } catch (error) {
      console.error("Error upgrading package:", error);
      // You might want to show an error message here
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 sm:py-32 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing packages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 sm:py-32 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Packages
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadPackages}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <FloatingElement>
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2 text-sm font-semibold text-white shadow-lg">
              <BoltIcon className="h-4 w-4 mr-2" />
              Simple Pricing
            </div>
          </FloatingElement>

          <FloatingElement delay={200}>
            <h1 className="mt-8 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
          </FloatingElement>

          <FloatingElement delay={400}>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
              From free access to enterprise solutions, we have a plan that fits
              your community engagement needs.
            </p>
          </FloatingElement>

          {/* Billing Toggle */}
          <FloatingElement delay={600}>
            <div className="mt-10 flex items-center justify-center">
              <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    billingCycle === "monthly"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    billingCycle === "yearly"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </FloatingElement>
        </div>

        {/* Pricing Cards */}
        <div
          className={`mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 ${
            packages.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          }`}
        >
          {packages.map((pkg, index) => {
            const PackageIcon = getPackageIcon(pkg.name);
            const gradient = getPackageGradient(pkg.name);
            const color = getPackageColor(pkg.name);
            const description = getPackageDescription(pkg.name);
            const popular = isPopularPackage(pkg.name);
            const features = formatFeatures(pkg.features);
            const isUpgrading = upgrading === pkg.id;

            // Calculate yearly pricing (20% discount)
            const yearlyPrice = pkg.price * 12 * 0.8;
            const displayPrice =
              billingCycle === "yearly" ? yearlyPrice : pkg.price;

            return (
              <FloatingElement key={pkg.id} delay={index * 150}>
                <div
                  className={`relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 hover:scale-105 ${
                    popular
                      ? "ring-4 ring-purple-500/20 bg-gradient-to-br from-purple-50 to-pink-50"
                      : "bg-white/80 backdrop-blur-sm border border-gray-200"
                  } hover:shadow-2xl h-full`}
                >
                  {popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-8 pt-10 h-full flex flex-col">
                    {/* Icon and Title */}
                    <div className="text-center">
                      <div
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg mb-6`}
                      >
                        <PackageIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 capitalize">
                        {pkg.name.toLowerCase()}
                      </h3>
                      <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                        {description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-8 text-center">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                          {pkg.price === 0
                            ? "Free"
                            : formatCurrency(displayPrice)}
                        </span>
                        {pkg.price > 0 && (
                          <span className="ml-2 text-gray-500 text-sm">
                            /
                            {billingCycle === "yearly"
                              ? "year"
                              : `${pkg.duration_days} days`}
                          </span>
                        )}
                      </div>
                      {billingCycle === "yearly" && pkg.price > 0 && (
                        <p className="mt-2 text-sm text-green-600 font-semibold">
                          Save {formatCurrency(pkg.price * 12 * 0.2)} yearly
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mt-8 space-y-4 flex-grow">
                      {features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <CheckIcon
                            className={`h-5 w-5 text-${color}-500 mr-3 flex-shrink-0 mt-0.5`}
                          />
                          <span className="text-gray-700 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-8 pt-4">
                      <button
                        onClick={() => handleSelectPackage(pkg.id)}
                        disabled={isUpgrading}
                        className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
                          isUpgrading
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : popular
                            ? `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl`
                            : pkg.price === 0
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl`
                        }`}
                      >
                        {isUpgrading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : pkg.price === 0 ? (
                          "Get Started Free"
                        ) : (
                          `Choose ${pkg.name}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </FloatingElement>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <FloatingElement delay={800}>
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                We work with large organizations and government agencies to
                create tailored solutions that meet your specific needs.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
                  Contact Sales
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/20">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </FloatingElement>

        {/* FAQ Section */}
        <FloatingElement delay={1000}>
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Can I change plans anytime?
                </h4>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Is there a free trial?
                </h4>
                <p className="text-gray-600">
                  Our Free plan gives you access to basic features. You can
                  upgrade to paid plans when you're ready.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What payment methods do you accept?
                </h4>
                <p className="text-gray-600">
                  We accept M-Pesa, bank transfers, and major credit cards for
                  your convenience.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Do you offer refunds?
                </h4>
                <p className="text-gray-600">
                  Yes, we offer a 30-day money-back guarantee if you're not
                  satisfied with our service.
                </p>
              </div>
            </div>
          </div>
        </FloatingElement>
      </div>
    </div>
  );
}
