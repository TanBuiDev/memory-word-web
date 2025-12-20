import { BookOpen } from "lucide-react";
import type { User } from "firebase/auth";

interface WelcomeBannerProps {
    user: User | null;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
    return (
        <div className="mb-8 relative">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-8 border border-indigo-100/50 shadow-lg shadow-indigo-100/20 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent pb-1">
                                    Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
                                </h1>
                                {/* <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse-glow" /> */}
                            </div>
                            <p className="text-gray-600 text-lg font-medium">
                                Manage your vocabulary and track your learning progress
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

