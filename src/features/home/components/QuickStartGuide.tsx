import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"

interface QuickStartGuideProps {
    onComplete: () => void
    userHasWords: boolean
}

interface Step {
    id: string
    title: string
    description: string
    icon: string
    target?: string // CSS selector for highlighting
    position?: "top" | "bottom" | "left" | "right" | "center"
}

export default function QuickStartGuide({ onComplete, userHasWords }: QuickStartGuideProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    const steps: Step[] = [
        {
            id: "welcome",
            title: "Chào mừng đến với MemoryWord! 🎉",
            description: "Ứng dụng học từ vựng thông minh với AI. Hãy cùng khám phá các tính năng chính!",
            icon: "👋",
            position: "center"
        },
        {
            id: "add-words",
            title: "Thêm từ vựng",
            description: "Nhập từ tiếng Anh vào ô tìm kiếm và nhấn 'Thêm'. Ứng dụng sẽ tự động tìm nghĩa, phiên âm và ví dụ cho bạn!",
            icon: "➕",
            target: '.flex.items-center.gap-3.bg-white', // Target the input container
            position: "bottom"
        },
        {
            id: "smart-quiz",
            title: "Smart Quiz - Học thông minh với AI",
            description: "Smart Quiz sử dụng AI để chọn những từ bạn cần ôn tập nhất. Hãy thử ngay để trải nghiệm!",
            icon: "🧠",
            target: 'a[href="/smart-quiz"], [data-tour="smart-quiz"]',
            position: "left"
        },
        {
            id: "analytics",
            title: "Theo dõi tiến độ",
            description: "Xem thống kê chi tiết về quá trình học của bạn: số ngày liên tiếp, độ chính xác, và những từ khó nhất.",
            icon: "📊",
            target: 'a[href="/analytics"], [data-tour="analytics"]',
            position: "left"
        },
        {
            id: "complete",
            title: "Bắt đầu học ngay! 🚀",
            description: userHasWords
                ? "Bạn đã có từ vựng! Hãy thử Smart Quiz để bắt đầu học ngay."
                : "Thêm từ vựng đầu tiên của bạn và bắt đầu hành trình học tập!",
            icon: "✨",
            position: "center"
        }
    ]

    useEffect(() => {
        if (currentStep >= steps.length) {
            onComplete()
            return
        }

        const step = steps[currentStep]

        // Reset highlight
        setHighlightedElement(null)

        if (step.target) {
            const element = document.querySelector(step.target) as HTMLElement
            if (element) {
                setHighlightedElement(element)
                // Scroll to element
                element.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }

        // Auto-advance welcome step after 3 seconds
        if (step.id === "welcome") {
            const timer = setTimeout(() => {
                setCurrentStep(1)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [currentStep])

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onComplete()
        }
    }

    const handleSkip = () => {
        onComplete()
    }

    const currentStepData = steps[currentStep]
    if (!currentStepData) return null

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!highlightedElement || currentStepData.position === "center") {
            return {
                position: "fixed" as const,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10001
            }
        }

        const rect = highlightedElement.getBoundingClientRect()
        const spacing = 20

        switch (currentStepData.position) {
            case "top":
                return {
                    position: "fixed" as const,
                    bottom: window.innerHeight - rect.top + spacing,
                    left: rect.left + rect.width / 2,
                    transform: "translateX(-50%)",
                    zIndex: 10001
                }
            case "bottom":
                return {
                    position: "fixed" as const,
                    top: rect.bottom + spacing,
                    left: rect.left + rect.width / 2,
                    transform: "translateX(-50%)",
                    zIndex: 10001
                }
            case "left":
                return {
                    position: "fixed" as const,
                    top: rect.top + rect.height / 2,
                    right: window.innerWidth - rect.left + spacing,
                    transform: "translateY(-50%)",
                    zIndex: 10001
                }
            case "right":
                return {
                    position: "fixed" as const,
                    top: rect.top + rect.height / 2,
                    left: rect.right + spacing,
                    transform: "translateY(-50%)",
                    zIndex: 10001
                }
            default:
                return {
                    position: "fixed" as const,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10001
                }
        }
    }

    return (
        <>
            {/* Overlay with spotlight effect */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/70 z-[9999] transition-opacity"
                onClick={currentStepData.position === "center" ? undefined : handleNext}
            >
                {highlightedElement && (
                    <div
                        className="absolute border-4 border-fuchsia-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none animate-pulse"
                        style={{
                            top: highlightedElement.getBoundingClientRect().top - 4,
                            left: highlightedElement.getBoundingClientRect().left - 4,
                            width: highlightedElement.getBoundingClientRect().width + 8,
                            height: highlightedElement.getBoundingClientRect().height + 8
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in"
                style={getTooltipStyle()}
            >
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mb-4">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all ${index === currentStep
                                ? "w-6 bg-fuchsia-600"
                                : index < currentStep
                                    ? "w-1.5 bg-fuchsia-300"
                                    : "w-1.5 bg-gray-200"
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                    <div className="text-5xl mb-2">{currentStepData.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800">
                        {currentStepData.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {currentStepData.description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition"
                    >
                        Bỏ qua
                    </button>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-medium transition"
                            >
                                ←
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full text-sm font-bold shadow-lg transition transform hover:scale-105"
                        >
                            {currentStep === steps.length - 1 ? "Hoàn thành ✓" : "Tiếp theo →"}
                        </button>
                    </div>
                </div>

                {/* Special action for last step */}
                {currentStep === steps.length - 1 && !userHasWords && (
                    <div className="mt-4 pt-4 border-t">
                        <Link
                            to="/"
                            onClick={onComplete}
                            className="block w-full text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-fuchsia-900 rounded-full font-bold transition"
                        >
                            Thêm từ đầu tiên
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

