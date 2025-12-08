import { ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <section id="home" className="pt-24 pb-12 md:pt-32 md:pb-24 bg-gradient-to-b from-indigo-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
                        <Zap className="h-4 w-4 mr-2" />
                        AI-Powered Smart Learning
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Học từ vựng siêu tốc với <br className="hidden md:block" />
                        <span className="text-indigo-600">Spaced Repetition</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                        Hệ thống tự động theo dõi hành vi học tập, dự đoán thời điểm bạn sắp quên và nhắc nhở đúng lúc.
                        Đừng học chăm chỉ, hãy học thông minh.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => navigate('/home')}
                            className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Bắt đầu học ngay
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => {
                                const aboutSection = document.getElementById('about');
                                if (aboutSection) {
                                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className="flex items-center justify-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-xl transition-all"
                        >
                            Tìm hiểu thêm
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;