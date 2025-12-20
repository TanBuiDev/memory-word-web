import { Brain, Cpu, Zap, Sparkles, Github, Twitter, Linkedin, Mail, Globe, ArrowUpRight, ChevronRight, Code } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Hàm scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Social links data
    const socialLinks = [
        { icon: Github, href: "https://github.com", label: "GitHub", color: "hover:text-gray-300" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-600" },
        { icon: Mail, href: "mailto:contact@memoryword.ai", label: "Email", color: "hover:text-red-400" }
    ];

    // Product links
    const productLinks = [
        { name: "Deep Learning AI", href: "#about", description: "SSA-LSTM Model" },
        { name: "Spaced Repetition", href: "#about", description: "Smart Scheduling" },
        { name: "Smart Vocabulary", href: "#about", description: "AI Suggestions" },
        { name: "Progress Analytics", href: "#", description: "Real-time Insights" }
    ];

    // Company links
    const companyLinks = [
        { name: "Về chúng tôi", href: "#", icon: Sparkles },
        { name: "Blog AI", href: "#", icon: Cpu },
        { name: "Tuyển dụng", href: "#", icon: Zap },
        { name: "Tài liệu API", href: "#", icon: Code }
    ];

    // Technology stack
    const techStack = [
        "TensorFlow.js", "React 18", "TypeScript", "Node.js",
        "Tailwind CSS", "MongoDB", "Redis", "Docker"
    ];

    return (
        <footer className="relative bg-linear-to-b from-gray-900 to-black overflow-hidden pt-16 pb-8">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px),
                                         linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}>
                </div>

                {/* Glowing Orbs */}
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-10"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10"></div>

                {/* Neural Network Lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="footer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,100 Q300,50 600,150 Q900,200 1200,100"
                        stroke="url(#footer-gradient)"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.3"
                    />
                </svg>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="p-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 shadow-lg">
                                    <Brain className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-30"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-linear-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                                    MemoryWord
                                </h2>
                                <p className="text-sm text-gray-400">AI-Powered Learning Platform</p>
                            </div>
                        </div>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Sử dụng công nghệ AI tiên tiến với mô hình SSA-LSTM để tối ưu hóa
                            quá trình học từ vựng, giúp bạn ghi nhớ nhanh hơn 2.5× và tiết kiệm 70% thời gian.
                        </p>

                        {/* Tech Stack Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {techStack.map((tech, index) => (
                                <span key={index}
                                    className="px-3 py-1 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Newsletter Subscription */}
                        <div className="bg-linear-to-r from-gray-900/50 to-indigo-900/30 rounded-xl p-4 border border-white/10">
                            <p className="text-sm font-medium text-white mb-2">Nhận bản tin AI</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button className="px-4 py-2 text-sm bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg transition-all">
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Sản phẩm
                        </h3>
                        <ul className="space-y-4">
                            {productLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="group flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="font-medium">{link.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">
                                            {link.description}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-cyan-500" />
                            Công ty
                        </h3>
                        <ul className="space-y-4">
                            {companyLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <link.icon className="h-4 w-4 text-gray-500 group-hover:text-current" />
                                        <span className="font-medium">{link.name}</span>
                                        <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="lg:col-span-4">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            Kết nối với chúng tôi
                        </h3>

                        <div className="mb-8">
                            <p className="text-gray-400 mb-4">
                                Luôn cập nhật các công nghệ AI mới nhất và nhận hỗ trợ từ đội ngũ chuyên gia.
                            </p>

                            {/* Social Links */}
                            <div className="flex gap-4 mb-6">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all ${social.color}`}
                                        aria-label={social.label}
                                    >
                                        <social.icon className="h-5 w-5" />
                                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {social.label}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-linear-to-r from-gray-900/50 to-purple-900/30 rounded-xl p-5 border border-white/10">
                            <h4 className="font-medium text-white mb-3">Liên hệ hỗ trợ</h4>
                            <div className="space-y-2">
                                <a href="mailto:support@memoryword.ai" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Mail className="h-4 w-4" />
                                    support@memoryword.ai
                                </a>
                                <a href="mailto:ai@memoryword.ai" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Brain className="h-4 w-4" />
                                    ai@memoryword.ai (AI Team)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mb-8"></div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-500">
                            © {currentYear} MemoryWord AI. Đã đăng ký bản quyền.
                            <span className="mx-2">•</span>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Chính sách bảo mật
                            </a>
                            <span className="mx-2">•</span>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Điều khoản dịch vụ
                            </a>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            MemoryWord sử dụng mô hình SSA-LSTM được huấn luyện trên 1.5 triệu điểm dữ liệu học tập.
                        </p>
                        <p className="text-[10px] text-gray-400 mt-4">
                            This site is protected by reCAPTCHA and the Google
                            <a href="https://policies.google.com/privacy" className="hover:underline"> Privacy Policy</a> and
                            <a href="https://policies.google.com/terms" className="hover:underline"> Terms of Service</a> apply.
                        </p>
                    </div>

                    {/* Back to Top Button */}
                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <span className="text-sm text-gray-400 group-hover:text-white">Lên đầu trang</span>
                        <div className="p-1.5 rounded bg-linear-to-r from-indigo-600/20 to-purple-600/20 group-hover:from-indigo-600/30 group-hover:to-purple-600/30">
                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-white transform rotate-90" />
                        </div>
                    </button>
                </div>

                {/* AI Stats Badge */}
                <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <div className="text-center">
                            <div className="font-bold text-white">92%</div>
                            <div className="text-gray-500">Độ chính xác AI</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-white">10k+</div>
                            <div className="text-gray-500">Người dùng</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-white">24/7</div>
                            <div className="text-gray-500">AI Support</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-white">99.9%</div>
                            <div className="text-gray-500">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;