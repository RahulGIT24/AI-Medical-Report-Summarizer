import { useState, useEffect } from "react";
import {
  Upload,
  Shield,
  LineChart,
  Users,
  Activity,
  ArrowRight,
  Menu,
  X,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export default function HealthScanLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const renderToSignUp = () => navigate("/signup");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Family Profiles",
      description:
        "Dedicated profiles for everyone. Keep records organized in one centralized hub.",
    },
    {
      icon: Upload,
      title: "Smart Storage",
      description:
        "Securely upload lab results, prescriptions, and medical records in any format.",
    },
    {
      icon: LineChart,
      title: "Track Trends",
      description:
        "Automatically map vitals and biomarkers over time to spot potential health issues.",
    },
    {
      icon: Activity,
      title: "AI Analysis",
      description:
        "Advanced AI breaks down complex medical jargon, explaining what your results mean.",
    },
  ];

  const benefits = [
    "Centralize family medical records",
    "Track chronic conditions accurately",
    "Demystify complex medical jargon",
    "Generate doctor-ready summaries",
    "Manage access securely",
    "Never lose paper reports again",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-500/30 font-sans overflow-hidden">
      {/* --- Navigation --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 shadow-lg"
            : "bg-transparent py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xl tracking-tighter">
                  HS
                </span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                HealthScan
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {["Features", "How It Works", "Benefits"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg border border-gray-700 transition-colors text-sm font-medium"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-linear-to-r from-blue-600 to-green-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/25 text-sm font-medium"
                onClick={renderToSignUp}
              >
                Get Started
              </motion.button>
            </div>

            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900 border-t border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {["Features", "How It Works", "Benefits"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block text-gray-400 hover:text-white font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    className="w-full bg-gray-800 text-white px-6 py-3 rounded-xl border border-gray-700"
                    onClick={() => navigate("/signin")}
                  >
                    Sign In
                  </button>
                  <button
                    className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg"
                    onClick={renderToSignUp}
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[90vh]">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-semibold tracking-wide">
              Introducing HealthScan 2.0
            </motion.div>
            <motion.h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Smart Health Management for Your{" "}
              <br className="hidden md:block" />
              <span className="bg-linear-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                Entire Family
              </span>
            </motion.h1>
            <motion.p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create profiles, securely store medical reports, and track vital
              health trends over time with our privacy-first AI analysis.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={renderToSignUp}
                className="group w-full sm:w-auto bg-white text-gray-950 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Create Free Account</span>
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold border border-gray-700 hover:bg-gray-800 text-white transition-colors">
                View Live Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Animated Hero Illustration */}
          <motion.div
            // variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl md:rounded-4xl p-4 md:p-8 border border-gray-800 shadow-2xl shadow-blue-500/10">
              <div className="aspect-video bg-gray-950 rounded-xl md:rounded-2xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-size-[24px_24px] opacity-20"></div>

                <div className="relative z-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-green-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Activity className="text-white" size={40} />
                  </div>
                  <p className="text-xl md:text-2xl font-semibold text-gray-300">
                    Upload Scan → AI Analysis → Health Insights
                  </p>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-10 left-10 md:top-20 md:left-20 bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-xl"
                >
                  <LineChart className="text-blue-400" size={32} />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-10 right-10 md:bottom-20 md:right-20 bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-xl"
                >
                  <Shield className="text-green-400" size={32} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50 bg-gray-950/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            // variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Everything Your Family Needs
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Powerful tools designed to make understanding and managing your
              family's health journey effortless.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                // variants={}
                whileHover={{ y: -5 }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-colors group"
              >
                <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/10 transition-colors">
                  <feature.icon className="text-blue-400" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              How It Works
            </h2>
            <p className="text-lg text-gray-400">
              From messy paper records to actionable insights in three simple
              steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0"></div>

            {[
              {
                step: "01",
                title: "Create Profiles",
                desc: "Add family members to keep histories securely separated.",
              },
              {
                step: "02",
                title: "Upload Scans",
                desc: "Snap a photo or upload PDFs of lab results and imaging.",
              },
              {
                step: "03",
                title: "Track & Analyze",
                desc: "AI extracts data, plots trends, and explains the results.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10"
              >
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 h-full hover:border-blue-500/30 transition-colors">
                  <div className="text-4xl font-black text-gray-800 mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Benefits Section --- */}
      <section
        id="benefits"
        className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-linear-to-b from-blue-900/10 to-green-900/10 pointer-events-none" />
        <div className="absolute top-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Why Families Choose Us
            </h2>
            <p className="text-lg text-gray-400">
              Peace of mind knowing your loved ones' health data is organized.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                // 
                className="flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <div className="shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                  <Check size={16} strokeWidth={3} />
                </div>
                <p className="text-gray-200 font-medium">{benefit}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-linear-to-br from-gray-900 to-gray-950 rounded-[3rem] p-10 md:p-20 text-center border border-gray-800 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/20 blur-[100px]" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Start Tracking Today
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Digitize your medical cabinet and unlock AI-driven health insights
              instantly. No credit card required to start.
            </p>
            <button
              onClick={renderToSignUp}
              className="group bg-white text-gray-950 px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-100 transition-all flex items-center space-x-2 mx-auto"
            >
              <span>Create Your Account</span>
              <ArrowRight
                className="group-hover:translate-x-1 transition-transform"
                size={24}
              />
            </button>
          </div>
        </motion.div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-gray-800 bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HS</span>
            </div>
            <span className="text-xl font-bold text-white">HealthScan</span>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            Empowering families with intelligent health insights.
          </p>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} HealthScan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
