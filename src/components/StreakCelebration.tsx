import { useEffect, useState } from "react"

interface StreakCelebrationProps {
    streak: number
    isNewRecord: boolean
    onClose: () => void
}

export default function StreakCelebration({ streak, isNewRecord, onClose }: StreakCelebrationProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setShow(true), 100)
    }, [])

    const handleClose = () => {
        setShow(false)
        setTimeout(onClose, 300)
    }

    // Determine celebration level
    let icon = "🔥"
    let title = "Streak tiếp tục!"
    let message = `Bạn đã học ${streak} ngày liên tiếp!`
    let color = "from-orange-400 to-red-500"

    if (streak >= 100) {
        icon = "👑"
        title = "HUYỀN THOẠI!"
        message = `${streak} ngày liên tiếp! Bạn là người kiên trì nhất!`
        color = "from-yellow-400 to-orange-500"
    } else if (streak >= 50) {
        icon = "💎"
        title = "XUẤT SẮC!"
        message = `${streak} ngày liên tiếp! Bạn thật tuyệt vời!`
        color = "from-cyan-400 to-blue-500"
    } else if (streak >= 30) {
        icon = "🏆"
        title = "THÀNH TÍCH ĐỈNH CAO!"
        message = `${streak} ngày liên tiếp! Tiếp tục phát huy!`
        color = "from-purple-400 to-pink-500"
    } else if (streak >= 7) {
        icon = "🌟"
        title = "MỘT TUẦN HOÀN HẢO!"
        message = `${streak} ngày liên tiếp! Bạn đang làm rất tốt!`
        color = "from-green-400 to-emerald-500"
    } else if (streak >= 3) {
        icon = "🎯"
        title = "ĐANG LÊN DỐC!"
        message = `${streak} ngày liên tiếp! Hãy tiếp tục!`
        color = "from-blue-400 to-cyan-500"
    }

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div 
                className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transform transition-all duration-300 ${show ? 'scale-100' : 'scale-75'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Animated Icon */}
                <div className="text-8xl mb-4 animate-bounce">
                    {icon}
                </div>

                {/* Title */}
                <h2 className={`text-3xl font-extrabold mb-3 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                    {title}
                </h2>

                {/* Message */}
                <p className="text-gray-700 text-lg mb-2">
                    {message}
                </p>

                {/* New Record Badge */}
                {isNewRecord && (
                    <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
                        🎉 KỶ LỤC MỚI! 🎉
                    </div>
                )}

                {/* Motivational Quote */}
                <p className="text-gray-500 text-sm italic mt-4 mb-6">
                    "{getMotivationalQuote(streak)}"
                </p>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className={`w-full py-3 bg-gradient-to-r ${color} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
                >
                    Tiếp tục học! 🚀
                </button>
            </div>
        </div>
    )
}

function getMotivationalQuote(streak: number): string {
    const quotes = [
        "Sự kiên trì là chìa khóa thành công!",
        "Mỗi ngày một chút, thành công sẽ đến!",
        "Bạn đang làm điều tuyệt vời!",
        "Không có gì là không thể với sự kiên trì!",
        "Hành trình ngàn dặm bắt đầu từ một bước chân!",
        "Thành công là tổng của những nỗ lực nhỏ mỗi ngày!",
        "Bạn mạnh mẽ hơn bạn nghĩ!",
        "Tiếp tục đi, bạn đang trên đường đúng!",
        "Mỗi ngày bạn học là một ngày bạn tiến bộ!",
        "Đừng bao giờ từ bỏ ước mơ của mình!"
    ]

    if (streak >= 100) return "Bạn là nguồn cảm hứng cho mọi người!"
    if (streak >= 50) return "Sự kiên trì của bạn thật đáng kinh ngạc!"
    if (streak >= 30) return "Bạn đã chứng minh được sức mạnh của ý chí!"
    if (streak >= 7) return "Một tuần hoàn hảo! Bạn thật tuyệt vời!"

    return quotes[Math.floor(Math.random() * quotes.length)]
}

