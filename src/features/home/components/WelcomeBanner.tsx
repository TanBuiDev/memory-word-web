import type { User } from "firebase/auth";

interface WelcomeBannerProps {
    user: User | null;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
            </h1>
            <p className="text-gray-600 mt-2">
                Manage your vocabulary and track your learning progress
            </p>
        </div>
    );
}

