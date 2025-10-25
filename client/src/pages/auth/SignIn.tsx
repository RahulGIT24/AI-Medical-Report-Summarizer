import { useState } from "react";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { apiCall } from "../../lib/apiCall";

interface FormDataSigin {
  email: string,
  password: string,
}

export default function Signin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const [formdata, setFormdata] = useState<FormDataSigin>(
    {
      email: "",
      password: "",
    }
  )
  const onChangeFData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormdata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  function resetForm() {
        setFormdata({
            email: "",
            password: "",
        })
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formdata.password.length < 8) {
      toast.error("Password Length Should be more than 8 characters")
      return;
    }
    try {
      setLoading(true);
      const res = await apiCall("/auth/signin","POST",formdata)
      toast.success(res.message)
      navigate("/dashboard")
      resetForm()
    } catch (error:any) {
      toast.error(error.response.data.detail)
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center py-4">
      <div className="max-w-md w-full bg-gray-800/60 border border-gray-700 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 backdrop-blur-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue to HealthScan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="password"
                value={formdata.password}
                onChange={(e) => onChangeFData(e)}
                type="password"
                placeholder="********"
                required
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-gray-400 text-center mt-4">
            Don’t have an account?{" "}
            <a href="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
