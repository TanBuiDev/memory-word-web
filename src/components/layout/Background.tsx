const Background = () => {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* 1. Lớp lưới (Grid Pattern) */}
            <div className="absolute h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* 2. Đốm màu 1 (Trái trên - Indigo) */}
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px] dark:opacity-30"></div>

            {/* 3. Đốm màu 2 (Phải dưới - Purple) */}
            <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-20 blur-[100px] dark:opacity-30"></div>

            {/* 4. Mask mờ ở giữa (Giúp phần nội dung chính rõ hơn) */}
            <div className="absolute inset-0 bg-white/30 dark:bg-slate-950/30 backdrop-blur-[1px]"></div>
        </div>
    );
};

export default Background;