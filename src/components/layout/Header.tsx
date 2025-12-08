import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, Brain, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import logo from '../../assets/memoai-logo-transparent.png';

const Header = () => {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();

    // State cho mobile menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // State cho scroll behavior
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);

    // Danh sách menu để dễ quản lý
    const navItems = [
        { name: 'Home', href: 'home' },
        { name: 'About', href: 'about' },
        { name: 'Contact', href: 'contact' },
    ];

    // Hàm xử lý smooth scroll
    // Header.tsx - Chỉnh sửa hàm handleSmoothScroll
    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();

        const element = document.getElementById(id);
        if (element) {
            // Tính toán chính xác vị trí, bao gồm cả header fixed
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 80;

            // Lấy vị trí absolute của element
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset;

            // Trừ đi chiều cao header và thêm padding
            const offsetPosition = elementTop - headerHeight - 20; // Thêm 20px padding

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        setIsMenuOpen(false);
    };

    // Hàm toggle mobile menu
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Hàm xử lý đăng xuất
    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

    // Effect xử lý scroll để ẩn/hiện header
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsHeaderHidden(true);
            } else if (currentScrollY < lastScrollY.current) {
                setIsHeaderHidden(false);
            }

            if (currentScrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Đóng menu mobile khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuOpen && !(event.target as Element).closest('header')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    // Thêm CSS animations vào head
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
                50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
            }
            
            .animate-pulse-glow {
                animation: pulseGlow 2s ease-in-out infinite;
            }
            
            .animate-float {
                animation: float 3s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <>
            <header
                className={`
                    fixed top-4 left-4 right-4 z-50 rounded-2xl 
                    transition-all duration-500 ease-in-out
                    border
                    ${isHeaderHidden ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}
                    ${isScrolled
                        ? 'bg-linear-to-r from-gray-900/80 to-indigo-950/80 backdrop-blur-xl shadow-2xl border-indigo-500/30'
                        : 'bg-linear-to-r from-gray-900/90 to-indigo-950/90 backdrop-blur-lg border-white/20'
                    }
                    hover:shadow-2xl hover:border-indigo-400/40
                `}
                style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                {/* Neural Network Background Elements */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,25 Q150,10 300,40 Q450,60 600,35 Q750,10 900,45 Q1050,80 1200,25"
                            stroke="url(#header-gradient)"
                            strokeWidth="1"
                            fill="none"
                            opacity="0.5"
                        />
                    </svg>

                    {/* Glowing particles */}
                    <div className="absolute top-2 right-20 w-2 h-2 bg-purple-400 rounded-full blur-sm animate-pulse-glow"></div>
                    <div className="absolute bottom-2 left-32 w-1 h-1 bg-blue-400 rounded-full blur-sm animate-pulse-glow animation-delay-1000"></div>
                    <div className="absolute top-4 left-40 w-1.5 h-1.5 bg-indigo-400 rounded-full blur-sm animate-pulse-glow animation-delay-500"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo + Brand Name */}
                        <Link
                            to="/"
                            className="flex items-center space-x-3 group relative"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <div className="relative animate-float">
                                <img
                                    src={logo}
                                    alt="MemoAI Logo"
                                    className="h-10 w-auto transition-all duration-300 
                                             group-hover:scale-110 group-hover:rotate-3 filter drop-shadow-lg"
                                />
                                <div className="absolute -inset-2 bg-linear-to-r from-purple-500/20 to-blue-500/20 
                                               rounded-full blur-xl opacity-0 group-hover:opacity-100 
                                               transition-opacity duration-500" />
                                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="relative">
                                <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 
                                             bg-clip-text text-transparent">
                                    MemoryWord
                                </h1>
                                <p className="text-xs bg-linear-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                                    AI-Powered Learning
                                </p>
                                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-blue-400 to-purple-400 
                                               group-hover:w-full transition-all duration-300"></div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={`#${item.href}`}
                                    onClick={(e) => handleSmoothScroll(e, item.href)}
                                    className="relative px-4 py-2 rounded-lg text-gray-200 hover:text-white 
                                             transition-all duration-300 font-medium cursor-pointer group"
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 to-purple-500/0 
                                                   rounded-lg group-hover:from-indigo-500/10 group-hover:to-purple-500/10 
                                                   transition-all duration-300"></div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 
                                                   bg-linear-to-r from-blue-400 to-purple-400 group-hover:w-3/4 
                                                   transition-all duration-300"></div>
                                </a>
                            ))}
                        </nav>

                        {/* Auth Buttons (Desktop) */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white 
                                             font-medium px-4 py-2 rounded-lg hover:bg-white/10 
                                             transition-all duration-300 group relative"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-red-500/0 to-pink-500/0 
                                                   rounded-lg group-hover:from-red-500/10 group-hover:to-pink-500/10 
                                                   transition-all duration-300"></div>
                                    <LogOut className="h-4 w-4 relative z-10" />
                                    <span className="relative z-10">Đăng xuất</span>
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-300 hover:text-white font-medium px-4 py-2 
                                                 rounded-lg hover:bg-white/10 transition-all duration-300 relative group"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 to-purple-500/0 
                                                       rounded-lg group-hover:from-blue-500/10 group-hover:to-purple-500/10 
                                                       transition-all duration-300"></div>
                                        <span className="relative z-10">Đăng nhập</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="relative bg-linear-to-r from-blue-500 to-purple-600 text-white 
                                                 px-6 py-2 rounded-xl hover:shadow-2xl hover:scale-105 
                                                 transition-all duration-300 font-medium group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 
                                                       translate-x-[-100%] group-hover:translate-x-[100%] 
                                                       transition-transform duration-1000"></div>
                                        <span className="relative flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            Đăng ký
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 
                                         transition-colors focus:outline-none group relative"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMenuOpen}
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-purple-500/0 to-blue-500/0 
                                               rounded-lg group-hover:from-purple-500/20 group-hover:to-blue-500/20 
                                               transition-all duration-300"></div>
                                {isMenuOpen ? (
                                    <X className="h-6 w-6 text-gray-200 relative z-10" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-200 relative z-10" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div
                        className="md:hidden border-t border-white/20 mt-2 animate-slideDown bg-linear-to-b from-gray-900/95 to-indigo-950/95 backdrop-blur-xl"
                        style={{
                            animation: 'slideDown 0.3s ease-out'
                        }}
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={`#${item.href}`}
                                    onClick={(e) => handleSmoothScroll(e, item.href)}
                                    className="block px-4 py-3 rounded-lg text-gray-200 
                                             hover:text-white hover:bg-white/10 
                                             transition-colors font-medium cursor-pointer relative group"
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0.5 
                                                   bg-linear-to-r from-blue-400 to-purple-400 group-hover:w-2 
                                                   transition-all duration-300"></div>
                                </a>
                            ))}

                            <div className="pt-3 border-t border-white/20 mt-2">
                                {user ? (
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                                                 text-center text-red-300 hover:text-red-100 font-medium 
                                                 hover:bg-red-500/10 rounded-lg transition-colors relative group"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-red-500/0 to-pink-500/0 
                                                       rounded-lg group-hover:from-red-500/10 group-hover:to-pink-500/10 
                                                       transition-all duration-300"></div>
                                        <LogOut className="h-4 w-4 relative z-10" />
                                        <span className="relative z-10">Đăng xuất</span>
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block px-4 py-3 text-center text-gray-200 hover:text-white 
                                                     font-medium hover:bg-white/10 rounded-lg mb-2 transition-colors relative group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 to-purple-500/0 
                                                           rounded-lg group-hover:from-blue-500/10 group-hover:to-purple-500/10 
                                                           transition-all duration-300"></div>
                                            <span className="relative z-10">Đăng nhập</span>
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block px-4 py-3 text-center relative
                                                     bg-linear-to-r from-blue-500 to-purple-600 
                                                     text-white rounded-xl font-medium group overflow-hidden"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 
                                                           translate-x-[-100%] group-hover:translate-x-[100%] 
                                                           transition-transform duration-1000"></div>
                                            <span className="relative flex items-center justify-center gap-2">
                                                <Brain className="h-4 w-4" />
                                                Đăng ký
                                            </span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;