import React, { useState } from "react";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { Loader2, X, UserPlus, Calendar, User, CircleSmall } from "lucide-react";
import { motion } from "framer-motion";

const CreatePatientModal = ({
  setIsModalOpen,
  fetchStats,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchStats: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    dob: "",
    gender: "M",
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall("/patients/create", "POST", formData);
      toast.success("Family member added successfully!");
      setIsModalOpen(false);
      setFormData({ fname: "", lname: "", dob: "", gender: "M" });
      fetchStats();
    } catch (error) {
      toast.error("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="bg-gray-900/90 border border-gray-800 rounded-4xl w-full max-w-md p-8 shadow-2xl shadow-black/50 relative overflow-hidden"
      >
        {/* Decorative Background Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />

        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-5 right-5 text-gray-500 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-transparent hover:border-gray-700 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-inner">
            <UserPlus className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Add New Member</h2>
            <p className="text-sm text-gray-400 font-medium">Create a profile to start tracking reports</p>
          </div>
        </div>

        <form onSubmit={handleCreateMember} className="space-y-4 relative z-10">
          
          {/* Name Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                <input
                  required
                  type="text"
                  value={formData.fname}
                  onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                  className={inputClasses}
                  placeholder="John"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                <input
                  required
                  type="text"
                  value={formData.lname}
                  onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                  className={inputClasses}
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 text-gray-500 z-10" size={18} />
              <input
                required
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className={`${inputClasses} [scheme:dark]`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
              Gender
            </label>
            <div className="relative">
              <CircleSmall className="absolute left-3.5 top-3.5 text-gray-500 z-10" size={18} />
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="M" className="bg-gray-900">Male</option>
                <option value="F" className="bg-gray-900">Female</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-xl hover:bg-gray-800 hover:text-white font-semibold transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Create Profile"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreatePatientModal;