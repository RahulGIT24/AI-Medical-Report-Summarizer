import { useState } from "react";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { apiCall } from "../../lib/apiCall";
import { motion } from "framer-motion";

interface FormDataSigin {
  email: string;
  password: string;
}

export default function Signin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formdata, setFormdata] = useState<FormDataSigin>({
    email: "",
    password: "",
  });

  const onChangeFData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function resetForm() {
    setFormdata({
      email: "",
      password: "",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formdata.password.length < 8) {
      toast.error("Password Length Should be more than 8 characters");
      return;
    }
    try {
      setLoading(true);
      const res = await apiCall("/auth/signin", "POST", formdata);
      toast.success(res?.message || "Successfully signed in!");
      navigate("/dashboard");
      resetForm();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "An error occurred during sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared input styling to match the Signup page exactly
  const inputClasses =
    "w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-950 relative overflow-hidden selection:bg-blue-500/30 font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-gray-900/80 border border-gray-800 rounded-4xl shadow-2xl shadow-blue-500/5 p-8 backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6"
          >
            <Lock className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue to HealthScan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3.5 text-gray-500"
                size={18}
              />
              <input
                type="email"
                name="email"
                value={formdata.email}
                onChange={onChangeFData}
                placeholder="you@example.com"
                required
                className={inputClasses}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-1.5 ml-1 pr-1">
              <label className="text-sm font-medium text-gray-400">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-3.5 text-gray-500"
                size={18}
              />
              <input
                name="password"
                value={formdata.password}
                onChange={onChangeFData}
                type="password"
                placeholder="••••••••"
                required
                className={inputClasses}
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-center mt-6 text-sm"
          >
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign up
            </a>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}
