import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

interface PaymentResponse {
  status: string;
  message?: string;
  data?: {
    checkout_url: string;
  };
}

interface SubscriptionCardProps {
  title?: string;
  price?: string;
  description?: string;
  className?: string;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title = "Premium Plan",
  price = "100",
  description = "Access all premium features",
  className = "",
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "test@gmail.com",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");

    if (status === "success") {
      navigate("/success", { replace: true });
    } else if (status === "fail") {
      navigate("/fail", { replace: true });
    }
  }, [location, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s-()]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post<PaymentResponse>(
        "http://localhost:8000/api/pay",
        {
          name: formData.name,
          phone: formData.phone,
        }
      );

      if (
        response.data.status === "success" &&
        response.data.data?.checkout_url
      ) {
        window.location.href = response.data.data.checkout_url;
      } else {
        setErrorMessage(
          response.data.message || "Payment initialization failed"
        );
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred while processing your payment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    focused: { scale: 1.02, transition: { duration: 0.2 } },
    unfocused: { scale: 1, transition: { duration: 0.2 } },
  };

  const labelVariants = {
    focused: {
      y: -28,
      scale: 0.85,
      color: "#3B82F6",
      transition: { duration: 0.2 },
    },
    unfocused: {
      y: 0,
      scale: 1,
      color: "#9CA3AF",
      transition: { duration: 0.2 },
    },
  };

  const InputField: React.FC<{
    icon: React.ReactNode;
    label: string;
    field: keyof FormData;
    type?: string;
    required?: boolean;
  }> = ({ icon, label, field, type = "text", required = true }) => {
    const hasValue = formData[field] !== "";
    const isFocused = focusedField === field;
    const hasError = errors[field];

    return (
      <motion.div
        className="relative mb-6"
        variants={inputVariants}
        animate={isFocused ? "focused" : "unfocused"}
      >
        <div className="relative">
          <motion.div
            className="absolute left-3 top-4 z-10"
            animate={{
              color: hasError ? "#EF4444" : isFocused ? "#3B82F6" : "#9CA3AF",
            }}
          >
            {icon}
          </motion.div>

          <motion.input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            className={`
              w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 rounded-xl
              text-gray-800 placeholder-transparent focus:outline-none transition-all duration-200
              ${
                hasError
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200/30 focus:border-blue-500"
              }
              hover:bg-white/20 focus:bg-white/20
            `}
            placeholder={label}
            required={required}
            disabled={field === "email"}
          />

          <motion.label
            className={`
              absolute left-12 pointer-events-none font-medium origin-left
              ${hasError ? "text-red-500" : ""}
              ${field === "email" ? "text-gray-400" : ""}
            `}
            variants={labelVariants}
            animate={isFocused || hasValue ? "focused" : "unfocused"}
          >
            {label}
            {required && " *"}
            {field === "email" && " (fixed for payment)"}
          </motion.label>
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center mt-2 text-red-500 text-sm"
            >
              <AlertCircle size={14} className="mr-1" />
              {hasError}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`max-w-md mx-auto ${className}`}
    >
      <motion.div
        whileHover={{
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-px">
          <div className="rounded-2xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 backdrop-blur-xl h-full w-full" />
        </div>

        <div className="relative p-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              {title}
            </h2>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {price} ETB / month
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <InputField
              icon={<User size={20} />}
              label="Full Name"
              field="name"
              required
            />

            <InputField
              icon={<Phone size={20} />}
              label="Phone Number"
              field="phone"
              type="tel"
              required
            />

            <InputField
              icon={<Mail size={20} />}
              label="Email Address"
              field="email"
              type="email"
              required={true}
            />

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center text-red-700">
                    <AlertCircle size={16} className="mr-2" />
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handlePayment}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-white text-lg
                bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                shadow-lg hover:shadow-xl transition-all duration-200
                disabled:opacity-70 disabled:cursor-not-allowed
                focus:outline-none focus:ring-4 focus:ring-blue-500/30
                relative overflow-hidden
              `}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Processing...
                  </motion.div>
                ) : (
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <CreditCard size={20} className="mr-2" />
                    Pay Now
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          <motion.p
            className="text-xs text-gray-500 text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            🔒 Your payment information is secure and encrypted
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionCard;
