import {
  Loader2,
  LogOut,
  FileText,
  Shield,
  User,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import CreatePatientModal from "../components/CreatePatientModal";
import { motion, AnimatePresence } from "framer-motion";

interface Stats {
  members: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState<Stats>({
    members: 0,
  });

  async function fetchStats() {
    try {
      const res = await apiCall("/user/stats");
      setUserStats({ members: res.members ?? 0 });
    } catch (e) {
      toast.error("Failed to load stats.");
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await apiCall("/auth/signout");
      toast.success("Signed Out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const dashboardOptions = [
    {
      icon: User,
      title: "Add New Member",
      description: "Create a new family member profile to start tracking their health.",
      iconBg: "bg-blue-500/10 text-blue-400",
      hoverBorder: "hover:border-blue-500/50",
      action: () => setIsModalOpen(true),
    },
    {
      icon: Users2,
      title: "View Members",
      description: "Access, review, and manage all your previously created profiles.",
      iconBg: "bg-green-500/10 text-green-400",
      hoverBorder: "hover:border-green-500/50",
      action: () => navigate("/members"),
    },
  ];

  const stats = [
    {
      label: "Total Members",
      value: userStats.members.toString(),
      icon: FileText,
      delay: 0.2
    },
  ];

  return (
    <main className="min-h-screen relative bg-gray-950 text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-green-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 flex justify-between items-center px-6 lg:px-10 py-6 border-b border-gray-800/50 bg-gray-950/50 backdrop-blur-xl"
      >
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl tracking-tighter">HS</span>
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent hidden sm:block">
            HealthScan
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex items-center space-x-2 bg-gray-900 border border-gray-800 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-800 hover:text-white transition-colors duration-300"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <span className="text-sm font-medium hidden sm:block">Sign Out</span>
              <LogOut size={18} />
            </>
          )}
        </motion.button>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Welcome Back! 👋
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Manage your family's health reports, upload new scans, and get AI-powered insights instantly.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
                <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
                  <stat.icon className="text-blue-400" size={26} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            Quick Actions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                whileHover={{ y: -5 }}
                onClick={option.action}
                className={`group bg-gray-900/80 backdrop-blur-xl rounded-4xl p-8 border border-gray-800 ${option.hoverBorder} transition-colors duration-300 text-left w-full relative overflow-hidden`}
              >
                {/* Subtle gradient hover effect */}
                <div className="absolute inset-0 bg-linear-to-br from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`relative w-16 h-16 ${option.iconBg} rounded-2xl flex items-center justify-center mb-6 border border-gray-800 group-hover:scale-110 transition-transform duration-300`}>
                  <option.icon size={30} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm pr-4">
                    {option.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Security Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-gray-800 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-green-500/20">
            <Shield className="text-green-400" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Enterprise-Grade Security
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm max-w-3xl">
              Your family's health data is encrypted at rest and in transit. We utilize advanced security protocols to ensure your medical information remains strictly private and accessible only by you.
            </p>
          </div>
        </motion.div>

      </div>

      {/* Add New Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CreatePatientModal
            setIsModalOpen={setIsModalOpen}
            fetchStats={fetchStats}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Dashboard;