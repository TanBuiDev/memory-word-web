import { BookOpen, Brain, Clock } from 'lucide-react';

const AboutSection = () => {
    const features = [
        {
            icon: <Brain className="h-8 w-8 text-indigo-600" />,
            title: "Deep Learning AI",
            desc: "Sử dụng mô hình LSTM để phân tích thói quen ghi nhớ của riêng bạn."
        },
        {
            icon: <Clock className="h-8 w-8 text-indigo-600" />,
            title: "Spaced Repetition",
            desc: "Lặp lại ngắt quãng khoa học, tối ưu hóa thời gian ôn tập."
        },
        {
            icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
            title: "Smart Vocabulary",
            desc: "Kho từ vựng phong phú, tự động gợi ý từ vựng phù hợp trình độ."
        }
    ];

    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tại sao chọn MemoryWord?</h2>
                    <p className="text-lg text-gray-600">Chúng tôi không chỉ là app từ điển, chúng tôi là huấn luyện viên trí nhớ của bạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <div key={index} className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="mb-4 bg-white p-3 rounded-lg inline-block shadow-sm">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutSection;