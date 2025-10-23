import { useState, useEffect } from "react";
import {
    Upload,
    MessageSquare,
    Shield,
    Zap,
    ArrowRight,
    Menu,
    X,
    Check,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function HealthScanLanding() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate()

    const renderToSignUp = ()=>{
        navigate("/signup")
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
            icon: Upload,
            title: "Upload Health Reports",
            description:
                "Simply upload your medical reports, lab results, or health documents in any format.",
        },
        {
            icon: MessageSquare,
            title: "Ask Questions",
            description:
                "Query your health data using natural language and get instant, accurate answers.",
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description:
                "Your health data is encrypted and stored securely with enterprise-grade protection.",
        },
        {
            icon: Zap,
            title: "AI-Powered Insights",
            description:
                "Advanced RAG + LLM technology analyzes your reports to provide intelligent insights.",
        },
    ];

    const benefits = [
        "Understand complex medical terminology instantly",
        "Track health trends over time",
        "Get personalized health insights",
        "Access your data anytime, anywhere",
        "No more confusion about lab results",
        "Share reports with doctors easily",
    ];

    return (
        <div>
            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? "bg-gray-900/90 backdrop-blur-lg shadow-lg shadow-blue-500/10"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                                HealthScan
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                How It Works
                            </a>
                            <a
                                href="#benefits"
                                className="text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                Benefits
                            </a>
                            <button className="bg-linear-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105" onClick={renderToSignUp}>
                                Get Started
                            </button>
                        </div>

                        <button
                            className="md:hidden text-gray-300"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-gray-800 border-t border-gray-700">
                        <div className="px-4 py-4 space-y-3">
                            <a
                                href="#features"
                                className="block text-gray-300 hover:text-blue-400"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="block text-gray-300 hover:text-blue-400"
                            >
                                How It Works
                            </a>
                            <a
                                href="#benefits"
                                className="block text-gray-300 hover:text-blue-400"
                            >
                                Benefits
                            </a>
                            <button className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg">
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent animate-fade-in">
                            Your Health Reports, Simplified
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
                            Upload your medical reports and get instant, intelligent answers
                            powered by advanced AI technology
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="group bg-linear-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2" onClick={renderToSignUp}>
                                <span>Start Free Trial</span>
                                <ArrowRight
                                    className="group-hover:translate-x-1 transition-transform"
                                    size={20}
                                />
                            </button>
                            <button className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-all duration-300">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Image/Illustration */}
                    <div className="mt-16 relative">
                        <div className="bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/20 p-8 border border-gray-700">
                            <div className="aspect-video bg-linear-to-br from-gray-800 via-slate-800 to-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                                <div className="relative z-10 text-center">
                                    <Upload className="mx-auto mb-4 text-blue-400" size={64} />
                                    <p className="text-2xl font-semibold text-gray-200">
                                        Upload → Analyze → Ask Questions
                                    </p>
                                </div>
                                {/* Floating elements */}
                                <div className="absolute top-4 left-4 bg-gray-800 rounded-lg p-3 shadow-lg shadow-blue-500/30 animate-float border border-gray-700">
                                    <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-blue-600 rounded"></div>
                                </div>
                                <div className="absolute bottom-8 right-8 bg-gray-800 rounded-lg p-3 shadow-lg shadow-green-500/30 animate-float-delayed border border-gray-700">
                                    <MessageSquare className="text-green-400" size={32} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/40 backdrop-blur-sm"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Everything you need to understand and manage your health data
                            effectively
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-gray-800 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700"
                            >
                                <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/50">
                                    <feature.icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-100">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-400">
                            Three simple steps to health clarity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "1",
                                title: "Upload",
                                desc: "Upload your health reports in any format - PDF, images, or documents",
                            },
                            {
                                step: "2",
                                title: "Process",
                                desc: "Our AI automatically extracts and organizes your health data securely",
                            },
                            {
                                step: "3",
                                title: "Query",
                                desc: "Ask questions in plain language and get instant, accurate answers",
                            },
                        ].map((item, index) => (
                            <div key={index} className="relative">
                                <div className="bg-gray-800 rounded-2xl p-8 shadow-xl shadow-blue-500/10 border border-gray-700">
                                    <div className="text-6xl font-bold bg-linear-to-br from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-gray-100">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="text-blue-500" size={32} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section
                id="benefits"
                className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-900/50 to-green-900/50 backdrop-blur-sm border-y border-gray-700"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            Why Choose HealthScan?
                        </h2>
                        <p className="text-xl text-gray-300">
                            Join thousands who trust us with their health data
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                            >
                                <div className="shrink-0 w-6 h-6 bg-linear-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mt-1">
                                    <Check className="text-gray-900" size={16} />
                                </div>
                                <p className="text-lg text-gray-200">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                        Ready to Take Control of Your Health Data?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Start your free trial today. No credit card required.
                    </p>
                    <button className="group bg-linear-to-r from-blue-600 to-green-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto" onClick={renderToSignUp}>
                        <span>Get Started Free</span>
                        <ArrowRight
                            className="group-hover:translate-x-1 transition-transform"
                            size={24}
                        />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <span className="text-white font-bold text-xl">H</span>
                        </div>
                        <span className="text-2xl font-bold">HealthScan</span>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Empowering you with intelligent health insights
                    </p>
                    <p className="text-gray-600 text-sm">
                        © 2025 HealthScan. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
