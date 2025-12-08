import { BrainCircuit, Github, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Info */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center mb-4">
                            <BrainCircuit className="h-8 w-8 text-indigo-500" />
                            <span className="ml-2 text-xl font-bold text-white">MemoryWord</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Nền tảng học từ vựng thông minh ứng dụng AI và phương pháp lặp lại ngắt quãng.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Sản phẩm</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Tính năng</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Bảng giá</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Công ty</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Về chúng tôi</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Tuyển dụng</a></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Kết nối</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
                    © {new Date().getFullYear()} MemoryWord. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;