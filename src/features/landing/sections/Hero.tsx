import { ArrowRight, Brain, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';

const HeroSection = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const handleStartLearning = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login', { state: { from: '/dashboard' } });
        }
    }

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            
            @keyframes gradient {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            .animate-blob {
                animation: blob 7s infinite;
            }
            
            .animation-delay-2000 {
                animation-delay: 2s;
            }
            
            .animation-delay-4000 {
                animation-delay: 4s;
            }
            
            .animate-gradient {
                background-size: 200% 200%;
                animation: gradient 3s ease infinite;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <section id="home" className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
            <div className="absolute inset-0"></div>

            {/* Animated Background*/}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating AI Nodes */}
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

                {/* Neural Network Lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="neuron-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                        </linearGradient>
                        <radialGradient id="pulse-gradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Neural Connections */}
                    <path d="M0,150 Q300,50 600,250 Q900,400 1200,200"
                        stroke="url(#neuron-gradient)"
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.4" />
                    <path d="M-100,350 Q200,200 500,400 Q800,500 1100,300"
                        stroke="url(#neuron-gradient)"
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.4" />

                    {/* Pulsing AI Core */}
                    <circle cx="50%" cy="50%" r="100" fill="url(#pulse-gradient)" opacity="0.3">
                        <animate attributeName="r" values="100;150;100" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
                    </circle>
                </svg>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/5 to-transparent"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {/* Premium Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>AI-Powered Smart Learning</span>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        <div className="text-white/90 mb-2">
                            Học từ vựng siêu tốc với
                        </div>
                        <div className="relative">
                            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                                Trí Tuệ Nhân Tạo
                            </span>
                        </div>
                    </h1>

                    {/* Subheading */}
                    <p className="max-w-2xl mx-auto text-xl text-gray-300 mb-12 leading-relaxed">
                        MemoryWord sử dụng mô hình <span className="text-indigo-300 font-semibold">SSA-LSTM</span> tiên tiến
                        để phân tích hành vi học tập, dự đoán chính xác thời điểm bạn sắp quên và tối ưu hóa lộ trình học.
                    </p>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap justify-center gap-6 mb-12">
                        <div className="text-center px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white mb-1">92%</div>
                            <div className="text-sm text-gray-400">Độ chính xác AI</div>
                        </div>
                        <div className="text-center px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white mb-1">2.5×</div>
                            <div className="text-sm text-gray-400">Tốc độ học</div>
                        </div>
                        <div className="text-center px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white mb-1">-70%</div>
                            <div className="text-sm text-gray-400">Thời gian học</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleStartLearning}
                            className="group relative flex items-center justify-center px-8 py-4 border-0 text-lg font-semibold rounded-xl text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 md:py-4 md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <span className="relative">Bắt đầu học ngay</span>
                            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => {
                                const aboutSection = document.getElementById('about');
                                if (aboutSection) {
                                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className="group flex items-center justify-center px-8 py-4 border border-white/20 text-lg font-semibold rounded-xl text-white bg-white/5 hover:bg-white/10 md:py-4 md:text-xl backdrop-blur-sm transition-all duration-300"
                        >
                            <Brain className="mr-3 h-5 w-5 text-purple-300" />
                            <span className="relative">Khám phá công nghệ</span>
                            <Target className="ml-3 h-5 w-5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-16 pt-8 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-4">Được tin dùng bởi</p>
                        <div className="flex flex-wrap justify-center gap-8 opacity-70">
                            <div className="text-gray-300 font-semibold">Học sinh</div>
                            <div className="text-gray-300 font-semibold">Sinh viên</div>
                            <div className="text-gray-300 font-semibold">Người đi làm</div>
                            <div className="text-gray-300 font-semibold">Giáo viên</div>
                        </div>
                    </div>

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
                </div>
            </div>
        </section>
    );
};

export default HeroSection;