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

  // State for the new member form

  async function fetchStats() {
    try {
      const res = await apiCall("/user/stats"); // Adjusted to match your stats endpoint
      setUserStats({ members: res.members ?? 0 });
    } catch (e) {
      toast.error("Failed to load stats.");
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await apiCall("/auth/signout");
      toast.success("Signed Out");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  }

  // Handler for form submission

  const dashboardOptions = [
    {
      icon: User,
      title: "Add New Member",
      description: "Create Your Member here",
      gradient: "from-blue-500 to-cyan-500",
      action: () => setIsModalOpen(true),
    },
    {
      icon: Users2,
      title: "View Created Members",
      description: "Access and review all your previously created members",
      gradient: "from-purple-500 to-pink-500",
      action: () => navigate("/reports"), // Navigates
    },
  ];

  const stats = [
    {
      label: "Total Members",
      value: userStats.members.toString(),
      icon: FileText,
    },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen relative bg-linear-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 lg:px-9 pt-6 lg:pt-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            HealthScan
          </span>
        </div>

        <button
          onClick={logout}
          className="border border-gray-600 text-white bg-transparent p-2.5 rounded-full hover:bg-white hover:border-white hover:text-slate-900 transition-all duration-300 cursor-pointer"
          title="Sign Out"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={25} />
          ) : (
            <LogOut size={25} />
          )}
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
            Welcome Back! 👋
          </h1>
          <p className="text-xl text-gray-400">
            Manage your health reports and get AI-powered insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Action Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {dashboardOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className="group relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 text-left"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${option.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                ></div>
                <div
                  className={`relative w-14 h-14 bg-linear-to-br ${option.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <option.icon className="text-white" size={28} />
                </div>
                <div className="relative">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-green-400 transition-all">
                    {option.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-linear-to-br from-blue-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Your Data is Secure
              </h3>
              <p className="text-gray-400 leading-relaxed">
                All your health reports are encrypted and stored securely. We
                use enterprise-grade security to ensure your medical information
                remains private and protected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Member Modal */}
      {isModalOpen && (
        <CreatePatientModal
          setIsModalOpen={setIsModalOpen}
          fetchStats={fetchStats}
        />
      )}
    </main>
  );
};

export default Dashboard;
