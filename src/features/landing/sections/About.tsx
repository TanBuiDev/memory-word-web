import { useState } from 'react';
import { BookOpen, Brain, Clock, ChevronDown, ChevronUp, Cpu, Activity, BarChart3, Zap, Target, Users } from 'lucide-react';
// Import component từ file riêng
import SSALSTMDiagram from '../components/SSALSTMDiagram';
import SpacedRepetitionDemo from '../components/SpacedRepetitionDemo';
import SmartVocabularyDemo from '../components/SmartVocabularyDemo';

const About = () => {
    const [activeFeature, setActiveFeature] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "tech" | "result">("overview");

    const features = [
        {
            id: 0,
            icon: <Brain className="h-8 w-8" />,
            title: "Deep Learning AI",
            desc: "Sử dụng mô hình SSA-LSTM để phân tích thói quen ghi nhớ của riêng bạn.",
            color: "from-indigo-600 to-purple-600",
            bgColor: "bg-linear-to-br from-indigo-50 to-purple-50",
            borderColor: "border-indigo-200",
            shadowColor: "shadow-indigo-100"
        },
        {
            id: 1,
            icon: <Clock className="h-8 w-8" />,
            title: "Spaced Repetition",
            desc: "Lặp lại ngắt quãng khoa học, tối ưu hóa thời gian ôn tập.",
            color: "from-blue-600 to-cyan-600",
            bgColor: "bg-linear-to-br from-blue-50 to-cyan-50",
            borderColor: "border-blue-200",
            shadowColor: "shadow-blue-100"
        },
        {
            id: 2,
            icon: <BookOpen className="h-8 w-8" />,
            title: "Smart Vocabulary",
            desc: "Kho từ vựng phong phú, tự động gợi ý từ vựng phù hợp trình độ.",
            color: "from-emerald-600 to-teal-600",
            bgColor: "bg-linear-to-br from-emerald-50 to-teal-50",
            borderColor: "border-emerald-200",
            shadowColor: "shadow-emerald-100"
        }
    ];

    const toggleFeature = (index: number) => {
        if (activeFeature === index) {
            setActiveFeature(null);
        } else {
            setActiveFeature(index);
            if (index === 0) {
                setActiveTab("overview");
            }
        }
    };

    return (
        <section id="about" className="relative py-24 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0"></div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* SSA Particles */}
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/5 to-transparent"></div>

                {/* Neural Network Lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="ssa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>

                    {/* Neural Network Connections */}
                    <path d="M50,100 Q150,50 250,150 Q350,250 450,200" stroke="url(#neural-gradient)" strokeWidth="0.5" fill="none" opacity="0.3" />
                    <path d="M100,300 Q200,200 300,300 Q400,400 500,350" stroke="url(#neural-gradient)" strokeWidth="0.5" fill="none" opacity="0.3" />
                    <path d="M150,150 Q250,100 350,200 Q450,300 550,250" stroke="url(#neural-gradient)" strokeWidth="0.5" fill="none" opacity="0.3" />

                    {/* SSA Optimization Path */}
                    <path d="M50,350 Q200,250 350,300 Q500,350 650,400" stroke="url(#ssa-gradient)" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="5,5">
                        <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                            AI-Powered Learning
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        <span className="bg-linear-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                            Công nghệ SSA-LSTM tiên tiến
                        </span>
                    </h2>

                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        MemoryWord không chỉ là một ứng dụng học từ vựng - chúng tôi là
                        <span className="text-indigo-300 font-semibold"> huấn luyện viên trí nhớ thông minh</span>
                        được hỗ trợ bởi AI tiên tiến nhất.
                    </p>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap justify-center gap-8 mt-10">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">+92%</div>
                            <div className="text-sm text-gray-400">Độ chính xác dự đoán</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">+38%</div>
                            <div className="text-sm text-gray-400">Hiệu suất cải thiện</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">×2.5</div>
                            <div className="text-sm text-gray-400">Tốc độ ghi nhớ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">-70%</div>
                            <div className="text-sm text-gray-400">Thời gian học</div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards*/}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`relative p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-500 cursor-pointer group
                ${activeFeature === feature.id
                                    ? `transform -translate-y-2 ${feature.bgColor} border-white shadow-2xl scale-[1.02] z-10`
                                    : activeFeature !== null
                                        ? 'opacity-50 hover:opacity-80 bg-white/5 border-white/10'
                                        : `bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10`
                                }`}
                            style={{
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            {/* Icon Container */}
                            <div className={`mb-5 p-3 rounded-xl inline-block transition-all duration-300 
                ${activeFeature === feature.id
                                    ? `bg-linear-to-br ${feature.color} shadow-lg`
                                    : 'bg-white/10'
                                }`}>
                                <div className={activeFeature === feature.id ? 'text-white' : 'text-white/90'}>
                                    {feature.icon}
                                </div>
                            </div>

                            <h3 className={`text-xl font-bold mb-3 transition-all duration-300
                ${activeFeature === feature.id
                                    ? `bg-linear-to-br ${feature.color} bg-clip-text text-transparent`
                                    : 'text-white'
                                }`}>
                                {feature.title}
                            </h3>

                            <p className={`leading-relaxed mb-6 transition-all duration-300
                ${activeFeature === feature.id ? 'text-gray-700' : 'text-gray-300'}`}>
                                {feature.desc}
                            </p>

                            {/* Animated Arrow */}
                            <div className={`absolute bottom-5 right-5 transition-all duration-300
                ${activeFeature === feature.id
                                    ? `text-white`
                                    : 'text-gray-400 group-hover:text-white'
                                }`}>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">
                                        {activeFeature === feature.id ? 'Đóng' : 'Tìm hiểu thêm'}
                                    </span>
                                    {activeFeature === feature.id ?
                                        <ChevronUp size={18} className="animate-bounce" /> :
                                        <ChevronDown size={18} className="group-hover:animate-bounce" />
                                    }
                                </div>
                            </div>

                            {/* Glow Effect */}
                            {activeFeature === feature.id && (
                                <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${feature.color} opacity-5 blur-xl`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- KHI CLICK DEEP LEARNING AI --- */}
                {activeFeature === 0 && (
                    <div className="mt-8 rounded-3xl border-2 border-white/10 bg-linear-to-br from-gray-900/50 to-indigo-950/50 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="grid grid-cols-1 lg:grid-cols-4">
                            {/* Sidebar Menu */}
                            <div className="bg-linear-to-b from-indigo-900/80 to-purple-900/80 text-white p-6 lg:col-span-1 border-r border-white/10">
                                <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600">
                                        <Cpu className="text-white" size={20} />
                                    </div>
                                    <span>SSA-LSTM Model</span>
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 group
                                            ${activeTab === "overview"
                                                ? "bg-linear-to-r from-white/20 to-white/10 text-white shadow-lg border border-white/20"
                                                : "hover:bg-white/5 text-indigo-200 hover:text-white border border-transparent"
                                            }`}
                                    >
                                        <Activity size={18} className={activeTab === "overview" ? "text-indigo-300" : "text-indigo-400"} />
                                        Tổng quan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("tech")}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 group
                                            ${activeTab === "tech"
                                                ? "bg-linear-to-r from-white/20 to-white/10 text-white shadow-lg border border-white/20"
                                                : "hover:bg-white/5 text-indigo-200 hover:text-white border border-transparent"
                                            }`}
                                    >
                                        <Brain size={18} className={activeTab === "tech" ? "text-purple-300" : "text-purple-400"} />
                                        Cơ chế hoạt động
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("result")}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 group
                                            ${activeTab === "result"
                                                ? "bg-linear-to-r from-white/20 to-white/10 text-white shadow-lg border border-white/20"
                                                : "hover:bg-white/5 text-indigo-200 hover:text-white border border-transparent"
                                            }`}
                                    >
                                        <BarChart3 size={18} className={activeTab === "result" ? "text-cyan-300" : "text-cyan-400"} />
                                        Hiệu quả
                                    </button>
                                </div>

                                {/* SSA-LSTM Badge */}
                                <div className="mt-8 p-4 rounded-lg bg-linear-to-r from-indigo-900/50 to-purple-900/50 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={16} className="text-yellow-400" />
                                        <span className="text-sm font-semibold text-white">Tối ưu hóa SSA</span>
                                    </div>
                                    <p className="text-xs text-indigo-200">9 hyperparameters được tối ưu tự động</p>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-8 lg:col-span-3 bg-linear-to-br from-white/95 to-gray-50">
                                {activeTab === "overview" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">Cá nhân hóa lộ trình học tập</h3>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed text-lg">
                                            Với sự phát triển nhanh chóng của
                                            <span className="font-bold text-indigo-700"> Big Data</span> và
                                            <span className="font-bold text-purple-700"> Trí tuệ nhân tạo (AI)</span>,
                                            giáo dục cá nhân hóa đang trở thành xu hướng tất yếu.
                                        </p>

                                        <div className="bg-linear-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-l-4 border-indigo-500 mt-6">
                                            <p className="text-indigo-800 italic text-lg font-medium">
                                                "Mục tiêu của MemoryWord là cung cấp một công cụ giảng dạy khoa học và hiệu quả,
                                                dự đoán chính xác nhu cầu của từng người học thông qua mô hình SSA-LSTM tiên tiến."
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 rounded-lg bg-indigo-100">
                                                        <Brain className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-800">Học tập thích ứng</h4>
                                                </div>
                                                <p className="text-gray-600">
                                                    Mô hình SSA-LSTM phân tích hành vi học tập của bạn để điều chỉnh lộ trình phù hợp nhất.
                                                </p>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 rounded-lg bg-purple-100">
                                                        <Target className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-800">Tối ưu thời gian</h4>
                                                </div>
                                                <p className="text-gray-600">
                                                    Giảm 70% thời gian học trong khi vẫn đạt 95% hiệu quả ghi nhớ.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "tech" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-2xl font-bold text-gray-800">Cơ chế hoạt động SSA-LSTM</h3>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Real-time Demo</span>
                                        </div>

                                        <SSALSTMDiagram />

                                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                                            <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                                                <h4 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-indigo-100">
                                                        <Clock size={18} className="text-indigo-600" />
                                                    </div>
                                                    Mô hình LSTM
                                                </h4>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    <span className="font-semibold">Long Short-Term Memory</span> vượt trội trong việc xử lý
                                                    <span className="text-indigo-600 font-medium"> dữ liệu chuỗi thời gian</span>.
                                                    Nó ghi nhớ lịch sử học tập, thời gian phản hồi và kết quả làm bài của bạn để nhận diện
                                                    mẫu hành vi quên/nhớ độc đáo.
                                                </p>
                                            </div>

                                            <div className="bg-linear-to-br from-pink-50 to-purple-50 p-5 rounded-xl border border-pink-100 shadow-sm">
                                                <h4 className="font-bold text-pink-700 mb-3 flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-pink-100">
                                                        <Activity size={18} className="text-pink-600" />
                                                    </div>
                                                    Thuật toán SSA
                                                </h4>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    <span className="font-semibold">Sparrow Search Algorithm</span> là thuật toán tối ưu hóa thông minh với khả năng
                                                    <span className="text-pink-600 font-medium"> tìm kiếm toàn cục mạnh mẽ</span>.
                                                    Nó được dùng để tinh chỉnh <span className="font-medium">9 siêu tham số</span> cho LSTM,
                                                    giúp mô hình học nhanh và chính xác hơn 38%.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "result" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600">
                                                <BarChart3 className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">Kết quả vượt trội với SSA-LSTM</h3>
                                        </div>

                                        <div className="bg-linear-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                                            <p className="text-emerald-800 font-medium mb-4">
                                                Nghiên cứu sử dụng mô hình SSA-LSTM để phân tích dữ liệu hành vi của người học tiếng Anh,
                                                đạt được kết quả vượt trội so với phương pháp truyền thống:
                                            </p>
                                            <ul className="space-y-4">
                                                <li className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mt-0.5">✓</span>
                                                    <span className="text-gray-700">
                                                        <span className="font-bold text-emerald-700">Lộ trình học tập do SSA-LSTM tạo ra</span> vượt trội hơn
                                                        <span className="font-medium"> 38%</span> so với mô hình LSTM truyền thống.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mt-0.5">✓</span>
                                                    <span className="text-gray-700">
                                                        <span className="font-bold text-emerald-700">Dự đoán chính xác hơn 92%</span> thời điểm bạn sắp quên từ vựng,
                                                        giúp ôn tập đúng lúc.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mt-0.5">✓</span>
                                                    <span className="text-gray-700">
                                                        <span className="font-bold text-emerald-700">Cải thiện khả năng tổng quát hóa</span> trên nhiều đối tượng người học khác nhau,
                                                        giảm thiểu overfitting.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mt-0.5">✓</span>
                                                    <span className="text-gray-700">
                                                        <span className="font-bold text-emerald-700">Tiết kiệm 70% thời gian học</span> trong khi vẫn duy trì
                                                        hiệu quả ghi nhớ ở mức tối ưu.
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                                <div className="text-2xl font-bold text-indigo-600 mb-1">92%</div>
                                                <div className="text-xs text-gray-600">Accuracy</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                                <div className="text-2xl font-bold text-purple-600 mb-1">38%</div>
                                                <div className="text-xs text-gray-600">Performance ↑</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                                <div className="text-2xl font-bold text-emerald-600 mb-1">70%</div>
                                                <div className="text-xs text-gray-600">Time Saved</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                                <div className="text-2xl font-bold text-cyan-600 mb-1">2.5×</div>
                                                <div className="text-xs text-gray-600">Faster Learning</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SPACED REPETITION */}
                {activeFeature === 1 && (
                    <div className="mt-8 animate-fade-in-up backdrop-blur-xl">
                        <SpacedRepetitionDemo />
                    </div>
                )}

                {/* 3. SMART VOCABULARY */}
                {activeFeature === 2 && (
                    <div className="mt-8 animate-fade-in-up backdrop-blur-xl">
                        <SmartVocabularyDemo />
                    </div>
                )}
            </div>
        </section>
    );
};

export default About;