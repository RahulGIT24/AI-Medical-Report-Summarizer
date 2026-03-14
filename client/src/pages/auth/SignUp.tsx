import { useState } from "react";
import { User, Mail, Lock, ArrowRight, Loader2, CircleSmall, Phone, Activity } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../lib/apiCall";
import { motion } from "framer-motion";

interface FormDataSignup {
    fname: string;
    lname: string;
    gender: "MALE" | "FEMALE";
    email: string;
    password: string;
    phonenumber: number | null;
}

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [formdata, setFormdata] = useState<FormDataSignup>({
        fname: "",
        lname: "",
        email: "",
        password: "",
        gender: "MALE",
        phonenumber: null
    });

    const onChangeFData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormdata(prev => ({
            ...prev,
            [name]: value
        }));
    };

    function resetForm() {
        setFormdata({
            fname: "",
            lname: "",
            email: "",
            password: "",
            gender: "MALE",
            phonenumber: null
        });
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formdata.password.length < 8) {
            toast.error("Password Length Should be more than 8 characters");
            return;
        }
        if (String(formdata.phonenumber).length !== 10) {
            toast.error("Invalid Phone number");
            return;
        }
        try {
            setLoading(true);
            const res = await apiCall("/auth/signup", "POST", formdata);
            toast.success(res.message);
            resetForm();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Shared input styling for consistency
    const inputClasses = "w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300";

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
                        <Activity className="text-white" size={32} />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join HealthScan and simplify your family's reports</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">
                    {/* First & Last Name Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    name="fname"
                                    placeholder="John"
                                    value={formdata.fname}
                                    required
                                    className={inputClasses}
                                    onChange={onChangeFData}
                                />
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    value={formdata.lname}
                                    required
                                    name="lname"
                                    onChange={onChangeFData}
                                    className={inputClasses}
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">Gender</label>
                        <div className="relative">
                            <CircleSmall className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                            <select 
                                name="gender" 
                                className={`${inputClasses} appearance-none cursor-pointer`} 
                                onChange={onChangeFData} 
                                value={formdata.gender}
                            >
                                <option value="MALE" className="bg-gray-900">Male</option>
                                <option value="FEMALE" className="bg-gray-900">Female</option>
                            </select>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
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

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                            <input
                                type="number"
                                name="phonenumber"
                                value={formdata.phonenumber || ""}
                                onChange={onChangeFData}
                                placeholder="9999999999"
                                min={0}
                                max={9999999999}
                                required
                                className={`${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <label className="text-sm font-medium text-gray-400 block mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                            <input
                                type="password"
                                name="password"
                                value={formdata.password}
                                onChange={onChangeFData}
                                placeholder="••••••••"
                                required
                                className={inputClasses}
                            />
                        </div>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-gray-400 text-center mt-6 text-sm"
                    >
                        Already have an account?{" "}
                        <a href="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign in
                        </a>
                    </motion.p>
                </form>
            </motion.div>
        </div>
    );
}