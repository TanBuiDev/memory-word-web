import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import logo from '../../assets/memoai-logo-transparent.png';

const Header = () => {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    
    // State cho mobile menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // State cho scroll behavior
    const [isHeaderHidden, setIsHeaderHidden] = useState(false); // Header có đang ẩn không
    const [isScrolled, setIsScrolled] = useState(false); // Đã scroll xuống chưa
    const lastScrollY = useRef(0); // Lưu vị trí scroll lần trước

    // Danh sách menu để dễ quản lý
    const navItems = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Contact', href: '#contact' },
    ];

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

            // Logic: nếu scroll xuống > 100px và xuống nhanh thì ẩn header
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Đang scroll xuống - ẩn header
                setIsHeaderHidden(true);
            } else if (currentScrollY < lastScrollY.current) {
                // Đang scroll lên - hiện header
                setIsHeaderHidden(false);
            }

            // Kiểm tra nếu đã scroll xuống (để thay đổi background)
            if (currentScrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Lưu vị trí scroll hiện tại cho lần sau
            lastScrollY.current = currentScrollY;
        };

        // Thêm event listener với passive để tối ưu performance
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Cleanup: xóa event listener khi component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Chỉ chạy 1 lần khi component mount

    // Đóng menu mobile khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Nếu menu đang mở và click bên ngoài header
            if (isMenuOpen && !(event.target as Element).closest('header')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <>
            {/* Header chính với các hiệu ứng */}
            <header
                className={`
                    fixed top-4 left-4 right-4 z-50 rounded-2xl 
                    transition-all duration-500 ease-in-out
                    border border-white/30 
                    
                    /* Logic ẩn/hiện khi scroll */
                    ${isHeaderHidden ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}
                    
                    /* Thay đổi background khi scroll */
                    ${isScrolled
                        ? 'bg-white/80 backdrop-blur-md shadow-lg border border-white/20' /* Khi Scroll: Kính mờ */
                        : 'bg-transparent shadow-none border border-transparent' /* Ban đầu: Trong suốt hoàn toàn */
                    }
                    
                    /* Hiệu ứng hover */
                    hover:shadow-2xl hover:bg-white/95
                `}
                style={{
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none', // Chỉ blur khi đã scroll
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                }}
            >
                {/* Container giới hạn chiều rộng và căn giữa */}
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* 1. Logo + Brand Name với hiệu ứng hover */}
                        <Link
                            to="/"
                            className="flex items-center space-x-3 group"
                            onClick={() => setIsMenuOpen(false)} // Đóng menu khi click logo
                        >
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="MemoAI Logo"
                                    className="h-10 w-auto transition-all duration-300 
                                             group-hover:scale-110 group-hover:rotate-3"
                                />
                                {/* Hiệu ứng glow khi hover */}
                                <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl 
                                               opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 
                                             bg-clip-text text-transparent">
                                    MemoAI
                                </h1>
                                <p className="text-xs text-gray-600/80">Smart Memory Assistant</p>
                            </div>
                        </Link>

                        {/* 2. Desktop Navigation (Ẩn trên mobile) */}
                        <nav className="hidden md:flex space-x-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-indigo-600 
                                             hover:bg-white/60 transition-all duration-300 font-medium"
                                >
                                    {item.name}
                                </a>
                            ))}
                        </nav>

                        {/* 3. Auth Buttons (Desktop) */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 
                                             font-medium px-4 py-2 rounded-lg hover:bg-white/60 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 
                                                 rounded-lg hover:bg-white/60 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-linear-to-r from-indigo-500 to-purple-600 text-white 
                                                 px-6 py-2 rounded-xl hover:shadow-xl hover:scale-105 
                                                 transition-all duration-300 font-medium"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* 4. Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-lg bg-white/50 hover:bg-white/80 
                                         transition-colors focus:outline-none"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <X className="h-6 w-6 text-gray-700" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown với animation */}
                {isMenuOpen && (
                    <div
                        className="md:hidden border-t border-white/30 mt-2 animate-slideDown"
                        style={{
                            animation: 'slideDown 0.3s ease-out'
                        }}
                    >
                        <div className="px-4 py-3 space-y-1">
                            {/* Menu items */}
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="block px-4 py-3 rounded-lg text-gray-700 
                                             hover:text-indigo-600 hover:bg-white/60 
                                             transition-colors font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </a>
                            ))}

                            {/* Auth buttons trong mobile menu */}
                            <div className="pt-3 border-t border-white/30 mt-2">
                                {user ? (
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                                                 text-center text-red-600 font-medium hover:bg-red-50 
                                                 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block px-4 py-3 text-center text-gray-700 
                                                     font-medium hover:bg-white/60 rounded-lg mb-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block px-4 py-3 text-center 
                                                     bg-linear-to-r from-indigo-500 to-purple-600 
                                                     text-white rounded-xl font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Spacer để nội dung không bị header che khi mới load */}
            {/* <div className="h-24" /> */}

            {/* CSS animation cho mobile menu */}
            <style>{`
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
            `}</style>
        </>
    );
};

export default Header;