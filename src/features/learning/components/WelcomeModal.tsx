import { useState } from "react"

interface WelcomeModalProps {
    onClose: () => void
    onStartQuiz: () => void
}

export default function WelcomeModal({ onClose, onStartQuiz }: WelcomeModalProps) {
    const [currentStep, setCurrentStep] = useState(0)

    const features = [
        {
            icon: "🤖",
            title: "AI-Powered Learning",
            description: "Our LSTM neural network analyzes your learning history to predict which words you're likely to forget. It prioritizes words that need the most practice."
        },
        {
            icon: "📊",
            title: "Smart Spaced Repetition",
            description: "Based on scientific research, words are scheduled for review at optimal intervals. Words you struggle with appear more frequently until you master them."
        },
        {
            icon: "🎯",
            title: "Personalized Quiz",
            description: "Each quiz session is tailored to your current knowledge level. The AI selects 10 words that will maximize your learning efficiency."
        },
        {
            icon: "📈",
            title: "Track Your Progress",
            description: "See your recall probability (p_recall) for each word. Lower percentages mean you need more practice. Watch it improve as you learn!"
        }
    ]

    const handleNext = () => {
        if (currentStep < features.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            // Last step - start quiz
            onStartQuiz()
        }
    }

    const handleSkip = () => {
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in relative">
                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl"
                    aria-label="Close"
                >
                    ×
                </button>

                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mb-6">
                    {features.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all ${index === currentStep
                                ? "w-8 bg-fuchsia-600"
                                : index < currentStep
                                    ? "w-2 bg-fuchsia-300"
                                    : "w-2 bg-gray-200"
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="text-center space-y-6 min-h-[300px] flex flex-col justify-center">
                    <div className="text-7xl mb-4 animate-bounce">
                        {features[currentStep].icon}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {features[currentStep].title}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed px-4">
                        {features[currentStep].description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                    <button
                        onClick={handleSkip}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
                    >
                        Bỏ qua
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-medium transition"
                            >
                                ← Trước
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full font-bold shadow-lg transition transform hover:scale-105"
                        >
                            {currentStep === features.length - 1 ? "Bắt đầu học! 🚀" : "Tiếp theo →"}
                        </button>
                    </div>
                </div>

                {/* Tip */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    💡 Bạn có thể xem lại hướng dẫn này bất cứ lúc nào
                </p>
            </div>
        </div>
    )
}

