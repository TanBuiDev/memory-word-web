import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../features/landing/sections/Hero';
import AboutSection from '../features/landing/sections/About';
import ContactSection from '../features/landing/sections/Contact';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';
import { useEffect, useState } from 'react';
import { Sparkles, Cpu, Zap, Brain } from 'lucide-react';

const LandingPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Hiệu ứng theo dõi chuột cho background particles (đã sửa - chỉ hiển thị particles không cần mousePosition)
    useEffect(() => {
        // Trigger animation khi page load
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Thêm CSS animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes pulseGlow {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
            
            @keyframes particleFloat {
                0%, 100% { 
                    transform: translate(0, 0) scale(1);
                    opacity: 0.3;
                }
                50% { 
                    transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(1.2);
                    opacity: 0.6;
                }
            }
            
            .animate-fade-in-up {
                animation: fadeInUp 0.8s ease-out forwards;
            }
            
            .animate-float {
                animation: float 3s ease-in-out infinite;
            }
            
            .animate-pulse-glow {
                animation: pulseGlow 2s ease-in-out infinite;
            }
            
            .animate-particle {
                animation: particleFloat 4s ease-in-out infinite;
            }
            
            .animation-delay-200 {
                animation-delay: 0.2s;
            }
            
            .animation-delay-400 {
                animation-delay: 0.4s;
            }
            
            .animation-delay-600 {
                animation-delay: 0.6s;
            }
            
            .animation-delay-800 {
                animation-delay: 0.8s;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Effect để xử lý scroll anchor
    useEffect(() => {
        // Xử lý hash trong URL
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                        const header = document.querySelector('header');
                        const headerHeight = header ? header.offsetHeight : 80;
                        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementTop - headerHeight - 20;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        };

        // Kiểm tra ngay khi load page
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-950 overflow-hidden">
            {/* Animated Background Particles - Đã sửa không cần mousePosition */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-[2px] h-[2px] bg-white rounded-full animate-particle`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            opacity: 0.3 + Math.random() * 0.4
                        }}
                    />
                ))}

                {/* Gradient Orbs */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10 animate-pulse-glow"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 animate-pulse-glow animation-delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-10 animate-pulse-glow animation-delay-500"></div>
            </div>

            {/* Neural Network Lines */}
            <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path
                    d="M-100,200 Q200,100 500,300 Q800,400 1300,250"
                    stroke="url(#neural-grad)"
                    strokeWidth="1"
                    fill="none"
                />
                <path
                    d="M-50,400 Q300,300 550,450 Q800,500 1250,350"
                    stroke="url(#neural-grad)"
                    strokeWidth="1"
                    fill="none"
                />
                <path
                    d="M0,500 Q400,400 600,550 Q800,600 1200,450"
                    stroke="url(#neural-grad)"
                    strokeWidth="1"
                    fill="none"
                />
            </svg>

            {/* AI Character Floating Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-20 left-10 animate-float">
                    <div className="p-3 rounded-xl bg-linear-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                        <Brain className="h-6 w-6 text-indigo-400" />
                    </div>
                </div>
                <div className="absolute top-40 right-20 animate-float animation-delay-500">
                    <div className="p-3 rounded-xl bg-linear-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
                        <Cpu className="h-6 w-6 text-blue-400" />
                    </div>
                </div>
                <div className="absolute bottom-40 left-20 animate-float animation-delay-1000">
                    <div className="p-3 rounded-xl bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                        <Zap className="h-6 w-6 text-purple-400" />
                    </div>
                </div>
                <div className="absolute bottom-20 right-10 animate-float animation-delay-1500">
                    <div className="p-3 rounded-xl bg-linear-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                <Header />

                <main className={`flex-grow transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Hero Section */}
                    <section id="home" className="relative overflow-hidden">
                        <HeroSection />

                        {/* Data Flow Animation between sections */}
                        <div className="absolute bottom-0 left-0 right-0 h-20">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,0 Q300,40 600,20 Q900,0 1200,30 Q1500,60 1800,20"
                                    stroke="url(#flow-gradient)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="5,5"
                                >
                                    <animate
                                        attributeName="stroke-dashoffset"
                                        values="0;10"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                </path>
                            </svg>
                        </div>
                    </section>

                    {/* About Section - with seamless transition */}
                    <div className="relative">
                        {/* Connecting Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-transparent via-gray-900/50 to-gray-950"></div>

                        <section id="about" className="relative pt-32 -mt-32">
                            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                            <AboutSection />
                        </section>
                    </div>

                    {/* Contact Section - with seamless transition */}
                    <div className="relative">
                        {/* Connecting Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-transparent via-gray-900/50 to-gray-950"></div>

                        <section id="contact" className="relative pt-32 -mt-32">
                            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent"></div>
                            <ContactSection />
                        </section>
                    </div>
                </main>

                <Footer />
            </div>

            <ScrollToTopButton />

            {/* Loading Animation */}
            {!isLoaded && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-950 z-50">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="mt-4 text-lg text-gray-300 font-medium">Đang khởi động AI...</p>
                    </div>
                </div>
            )}

            {/* Performance Stats - Đã sửa không dùng process.env */}
            {import.meta.env.DEV && (
                <div className="fixed bottom-4 left-4 z-50">
                    <div className="px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span>MemoryWord AI Ready</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;