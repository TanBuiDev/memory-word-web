import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../firebase"
import { useState } from "react"

// Giả lập Slide Data
const SLIDES = [
    { title: "Học từ qua Flashcard", desc: "Luyện tập ghi nhớ nhanh chóng với hệ thống thẻ lật thông minh.", icon: "✨" },
    { title: "Quiz Trắc nghiệm", desc: "Kiểm tra kiến thức với các bài trắc nghiệm cá nhân hóa.", icon: "🎯" },
    { title: "Sắp xếp theo Danh mục", desc: "Tổ chức từ vựng theo chủ đề, dễ dàng quản lý và ôn tập.", icon: "📚" },
]

export default function Login() {
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    const [currentSlide, setCurrentSlide] = useState(0)

    // Tự động chuyển slide sau 5 giây (chỉ chạy khi không hover)
    // Dùng useEffect và setInterval là cách chuẩn hơn, nhưng tạm dùng setTimeout cho đơn giản
    setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 2000);

    return (
        // 🎨 Nền Gradient: Đồng bộ (Fuchsia và Cyan nhạt)
        <div className="min-h-screen flex bg-gradient-to-tr from-fuchsia-50 to-cyan-50">

            {/* ⬅️ KHỐI GIỚI THIỆU (LEFT SIDE) */}
            {/* Ẩn trên màn hình nhỏ */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-16 bg-fuchsia-600 text-white relative overflow-hidden">

                {/* Hình ảnh và hiệu ứng */}
                <div className="absolute inset-0 opacity-10 bg-repeat [background-image:url('/dots.svg')]"></div>

                <h2 className="text-5xl font-extrabold mb-4 z-10 text-yellow-300">
                    MemoryWord
                </h2>
                <p className="text-xl text-center mb-10 z-10">
                    Nâng tầm kỹ năng tiếng Anh của bạn với phương pháp học từ vựng hiệu quả.
                </p>

                {/* Slideshow đơn giản */}
                <div className="bg-white/10 p-6 rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-md transition-all duration-1000">
                    <div className="text-7xl mb-4 text-center">
                        {SLIDES[currentSlide].icon}
                    </div>
                    <h3 className="text-3xl font-bold mb-2 text-yellow-300">
                        {SLIDES[currentSlide].title}
                    </h3>
                    <p className="text-base text-fuchsia-100">
                        {SLIDES[currentSlide].desc}
                    </p>
                </div>

                {/* Indicators */}
                <div className="flex gap-2 mt-6 z-10">
                    {SLIDES.map((_, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${index === currentSlide ? "bg-yellow-400" : "bg-white/50"
                                }`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>

            </div>

            {/* ➡️ KHỐI ĐĂNG NHẬP (RIGHT SIDE) */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8">

                <div
                    // 🎨 Bo góc lớn hơn (sử dụng giá trị tùy chỉnh hoặc rounded-3xl/4xl)
                    // và thêm khoảng padding trên dưới
                    className="max-w-md w-full p-10 bg-white rounded-[2rem] shadow-2xl space-y-6"
                >
                    {/* 1. Logo/Tên Ứng dụng */}
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="text-4xl font-extrabold text-fuchsia-600 mb-1">
                            MemoryWord
                        </h2>
                        <p className="text-sm text-gray-500">
                            Luyện từ vựng hiệu quả hơn.
                        </p>
                    </div>

                    {/* 2. Tiêu đề và Mô tả */}
                    <h1 className="text-3xl font-bold text-fuchsia-800 mb-1 text-center">
                        Chào mừng!
                    </h1>

                    <p className="text-gray-500 mb-8 text-center">
                        Bắt đầu học ngay với tài khoản Google.
                    </p>

                    <button
                        onClick={handleLogin}
                        className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-fuchsia-900 font-bold rounded-full shadow-lg transition flex items-center justify-center gap-3 transform hover:scale-[1.02]">
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google Logo"
                            className="w-5 h-5" />
                        <span>Đăng nhập với Google</span>
                    </button>
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        *Chúng tôi sẽ không chia sẻ thông tin cá nhân của bạn.
                    </p>
                </div>
            </div>
        </div>
    )
}