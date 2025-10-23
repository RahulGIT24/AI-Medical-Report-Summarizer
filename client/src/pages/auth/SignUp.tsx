import { useState } from "react";
import { User, Mail, Lock, ArrowRight, Loader2, CircleSmall, Phone } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

interface FormDataSignup {
    fname: string,
    lname: string,
    gender: "MALE" | "FEMALE"
    email: string,
    password: string,
    phonenumber: number | null
}

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [formdata, setFormdata] = useState<FormDataSignup>(
        {
            fname: "",
            lname: "",
            email: "",
            password: "",
            gender: "MALE",
            phonenumber: null
        }
    )

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
        })
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formdata.password.length < 8) {
            toast.error("Password Length Should be more than 8 characters")
            return;
        }
        if (String(formdata.phonenumber).length != 10) {
            toast.error("Invalid Phone number")
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(import.meta.env.VITE_BASE_URL + "/auth/signup", formdata)
            toast.success(res.data.message)
            resetForm()
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center py-4">
            <div className="max-w-lg w-full bg-gray-800/60 border border-gray-700 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 backdrop-blur-lg">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 mb-4">
                        <User className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Join HealthScan and simplify your reports</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label className="text-gray-300 block mb-2">First Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="fname"
                                placeholder="John"
                                value={formdata.fname}
                                required
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/70 transition-all duration-300"
                                onChange={(e) => onChangeFData(e)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-300 block mb-2">Last Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Doe"
                                value={formdata.lname}
                                required
                                name="lname"
                                onChange={(e) => onChangeFData(e)}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/70 transition-all duration-300"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-300 block mb-2">Gender</label>
                        <div className="relative">
                            <CircleSmall className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select name="gender" id="" className="w-full pl-10 bg-gray-900/50 border border-white-700 rounded-lg  pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/70 transition-all duration-300" onChange={(e) => onChangeFData(e)} value={formdata.gender}>
                                <option value="MALE" >Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-300 block mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formdata.email}
                                onChange={(e) => onChangeFData(e)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/70 transition-all duration-300"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-300 block mb-2">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="number"
                                name="phonenumber"
                                value={formdata.phonenumber || ""}
                                onChange={(e) => onChangeFData(e)}
                                placeholder="999999999"
                                min={0}
                                max={9999999999}
                                required
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/70 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-300 block mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                name="password"
                                value={formdata.password}
                                onChange={(e) => onChangeFData(e)}
                                placeholder="********"
                                required
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/70 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-2 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <p className="text-gray-400 text-center mt-4">
                        Already have an account?{" "}
                        <a href="/signin" className="text-blue-400 hover:text-blue-300">
                            Sign in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
