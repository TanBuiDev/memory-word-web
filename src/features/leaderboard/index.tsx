import { useState, useEffect, useMemo } from 'react';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { fetchLeaderboard } from './services/leaderboardService';
import type { LeaderboardUser, TimeFrame } from './types';
import Podium from './components/Podium';
import LeaderboardList from './components/LeaderboardList';
import StickyFooter from './components/StickyFooter';
import TimeFrameSwitcher from './components/TimeFrameSwitcher';
import Header from '../../components/layout/Header';
import Background from '../../components/layout/Background';

export default function Leaderboard() {
    const { user } = useAuthStore();
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<{
        users: LeaderboardUser[];
        currentUserRank?: number;
        currentUser?: LeaderboardUser;
    }>({
        users: [],
    });

    // Fetch leaderboard data
    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchLeaderboard(timeFrame, user?.uid);
                setLeaderboardData(data);
            } catch (err) {
                console.error('Error loading leaderboard:', err);
                setError('Failed to load leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, [timeFrame, user?.uid]);

    // Separate top 3 and the rest using useMemo for performance
    const { topThree, restOfUsers } = useMemo(() => {
        const topThree = leaderboardData.users.slice(0, 3);
        const restOfUsers = leaderboardData.users.slice(3);
        return { topThree, restOfUsers };
    }, [leaderboardData.users]);

    return (
        <div className="min-h-screen">
            <Header />
            <Background />

            <main className="pt-28 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg">
                                <Trophy className="h-8 w-8 text-yellow-800" fill="currentColor" />
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Leaderboard
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg mb-6">
                            Compete with other learners and climb the ranks!
                        </p>

                        {/* Time Frame Switcher */}
                        <div className="flex justify-center">
                            <TimeFrameSwitcher
                                timeFrame={timeFrame}
                                onChange={setTimeFrame}
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-600">Loading leaderboard...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50/80 backdrop-blur-md border border-red-200/60 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Leaderboard Content */}
                    {!loading && !error && (
                        <>
                            {/* Podium - Top 3 */}
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/60 p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                    Top Performers
                                </h2>
                                <Podium topUsers={topThree} timeFrame={timeFrame} />
                            </div>

                            {/* List - Rank 4 to 30 */}
                            {restOfUsers.length > 0 && (
                                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/60 p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                                        Rankings
                                    </h2>
                                    <LeaderboardList
                                        users={restOfUsers}
                                        currentUserId={user?.uid}
                                        timeFrame={timeFrame}
                                    />
                                </div>
                            )}

                            {/* Empty State */}
                            {leaderboardData.users.length === 0 && (
                                <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/60">
                                    <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        No rankings yet
                                    </h3>
                                    <p className="text-gray-600">
                                        Start learning to appear on the leaderboard!
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Sticky Footer - Current User */}
            {user && leaderboardData.currentUser && (
                <StickyFooter
                    currentUser={leaderboardData.currentUser}
                    timeFrame={timeFrame}
                />
            )}
        </div>
    );
}

