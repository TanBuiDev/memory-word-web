import { useState } from 'react';
import { Send, Mail, MessageSquare, User, CheckCircle, Loader2, Brain, Sparkles } from 'lucide-react';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Gợi ý 1: Validation với regex và real-time feedback
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập họ tên';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Vui lòng nhập nội dung tin nhắn';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Tin nhắn phải có ít nhất 10 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Gợi ý 2: Xử lý submit với loading và success state
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Gợi ý 3: Gửi data thực tế đến backend
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            setIsSubmitted(true);
            setFormData({ name: '', email: '', message: '' });

            // Gợi ý 4: Auto reset success message sau 5s
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            console.error('Gửi thất bại:', error);
            setErrors({ submit: 'Có lỗi xảy ra, vui lòng thử lại sau' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gợi ý 5: Real-time validation on blur
    const handleBlur = (field: string) => {
        if (formData[field as keyof typeof formData]) {
            validateForm();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        // Clear error khi người dùng bắt đầu nhập lại
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    return (
        <section id="contact" className="relative py-24 overflow-hidden">
            {/* Background giống với các section khác */}
            <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-indigo-950 to-purple-950"></div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                {/* Data Flow Animation */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="data-flow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,300 Q300,200 600,400 Q900,600 1200,350"
                        stroke="url(#data-flow-gradient)"
                        strokeWidth="1"
                        fill="none"
                        strokeDasharray="5,5"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;20"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                </svg>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Message Modal */}
                {isSubmitted && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-linear-to-br from-gray-900 to-indigo-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-indigo-500/30 animate-scale-in">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 mb-4">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Tin nhắn đã được gửi!</h3>
                                <p className="text-gray-300 mb-6">
                                    Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                            Kết nối với AI
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="bg-linear-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                            Liên hệ & Hỗ trợ
                        </span>
                    </h2>

                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Đội ngũ AI của chúng tôi luôn sẵn sàng lắng nghe ý kiến và cải thiện trải nghiệm học tập của bạn.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-linear-to-br from-gray-900/50 to-indigo-900/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-linear-to-r from-indigo-600/20 to-purple-600/20">
                                    <Brain className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">AI Support Team</h3>
                                    <p className="text-sm text-gray-400">Hỗ trợ 24/7</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Đội ngũ AI của chúng tôi phân tích và phản hồi nhanh chóng mọi câu hỏi.
                            </p>
                        </div>

                        <div className="bg-linear-to-br from-gray-900/50 to-indigo-900/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-linear-to-r from-blue-600/20 to-cyan-600/20">
                                    <Sparkles className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Phản hồi nhanh</h3>
                                    <p className="text-sm text-gray-400">Dưới 24 giờ</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Chúng tôi cam kết phản hồi mọi tin nhắn trong vòng 24 giờ làm việc.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-linear-to-br from-gray-900/50 to-indigo-900/50 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="p-8 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                                <User className="h-4 w-4 text-indigo-400" />
                                                Họ tên
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    onBlur={() => handleBlur('name')}
                                                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border backdrop-blur-sm text-white placeholder-gray-400
                                                        ${errors.name ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-indigo-500 focus:border-indigo-500'}
                                                        focus:ring-2 focus:outline-none transition-all`}
                                                    placeholder="Nguyễn Văn A"
                                                />
                                                {errors.name && (
                                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                        <span>⚠</span> {errors.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                                <Mail className="h-4 w-4 text-indigo-400" />
                                                Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={() => handleBlur('email')}
                                                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border backdrop-blur-sm text-white placeholder-gray-400
                                                        ${errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-indigo-500 focus:border-indigo-500'}
                                                        focus:ring-2 focus:outline-none transition-all`}
                                                    placeholder="email@example.com"
                                                />
                                                {errors.email && (
                                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                        <span>⚠</span> {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                            <MessageSquare className="h-4 w-4 text-indigo-400" />
                                            Nội dung tin nhắn
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                id="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('message')}
                                                className={`w-full px-4 py-3 rounded-lg bg-white/5 border backdrop-blur-sm text-white placeholder-gray-400 resize-none
                                                    ${errors.message ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-indigo-500 focus:border-indigo-500'}
                                                    focus:ring-2 focus:outline-none transition-all`}
                                                placeholder="Tôi muốn hỏi về tính năng SSA-LSTM..."
                                            ></textarea>
                                            {errors.message && (
                                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.message}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">Hãy mô tả chi tiết để AI có thể hỗ trợ tốt nhất</p>
                                    </div>

                                    {/* Submit Error */}
                                    {errors.submit && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                            <p className="text-red-400 text-sm">{errors.submit}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg
                                            ${isSubmitting
                                                ? 'bg-indigo-700 cursor-not-allowed'
                                                : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                            } text-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <Send className="h-5 w-5" />
                                                Gửi tin nhắn đến AI Team
                                            </>
                                        )}
                                    </button>

                                    {/* Privacy Note */}
                                    <p className="text-xs text-gray-400 text-center">
                                        Bằng cách gửi tin nhắn, bạn đồng ý với{' '}
                                        <a href="#" className="text-indigo-300 hover:text-indigo-200 underline">
                                            Chính sách bảo mật
                                        </a>{' '}
                                        của chúng tôi.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;