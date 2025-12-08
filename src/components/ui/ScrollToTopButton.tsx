import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // 1. Logic kiểm tra vị trí cuộn
    useEffect(() => {
        const toggleVisibility = () => {
            // Chỉ hiện nút khi user đã cuộn xuống quá 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // 2. Hàm xử lý cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Quan trọng: tạo hiệu ứng trượt mượt mà
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`
        fixed bottom-8 right-8 z-40 
        p-3 rounded-full shadow-lg
        bg-indigo-600 text-white 
        hover:bg-indigo-700 hover:scale-110 
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        
        /* Logic ẩn hiện: Dùng opacity và translate để animation mượt hơn */
        ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
        >
            <ArrowUp className="h-6 w-6" />
        </button>
    );
};

export default ScrollToTopButton;