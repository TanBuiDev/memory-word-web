import { Trophy, TrendingUp } from 'lucide-react';
import type { LeaderboardUser } from '../types';

interface LeaderboardListProps {
    users: LeaderboardUser[];
    currentUserId?: string;
    timeFrame: 'weekly' | 'allTime';
}

export default function LeaderboardList({ users, currentUserId, timeFrame }: LeaderboardListProps) {
    const getXP = (user: LeaderboardUser) => 
        timeFrame === 'weekly' ? user.stats.weeklyXP : user.stats.totalXP;

    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No users found in the leaderboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 no-scrollbar max-h-[500px] overflow-y-auto">
            {users.map((user) => {
                const isCurrentUser = currentUserId === user.id;
                const xp = getXP(user);

                return (
                    <div
                        key={user.id}
                        className={`
                            flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                            ${isCurrentUser
                                ? 'bg-gradient-to-r from-indigo-100/90 to-purple-100/90 backdrop-blur-md border-2 border-indigo-400 shadow-lg'
                                : 'bg-white/70 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 hover:shadow-md'
                            }
                        `}
                    >
                        {/* Rank */}
                        <div className={`
                            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                            ${isCurrentUser
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                : user.rank <= 10
                                    ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                                    : 'bg-gray-100 text-gray-600'
                            }
                        `}>
                            {user.rank}
                        </div>

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center border-2
                                ${isCurrentUser
                                    ? 'border-indigo-400 bg-gradient-to-br from-indigo-100 to-purple-100'
                                    : 'border-gray-200 bg-gray-100'
                                }
                            `}>
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className={`text-lg font-bold ${isCurrentUser ? 'text-indigo-700' : 'text-gray-600'}`}>
                                        {user.displayName[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold truncate ${isCurrentUser ? 'text-indigo-900' : 'text-gray-800'}`}>
                                    {user.displayName}
                                </span>
                                {isCurrentUser && (
                                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                                        You
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>{xp.toLocaleString()} XP</span>
                                {user.stats.streak > 0 && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span>🔥 {user.stats.streak} day streak</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Trophy for top 10 */}
                        {user.rank <= 10 && !isCurrentUser && (
                            <div className="flex-shrink-0">
                                <Trophy className={`h-5 w-5 ${user.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

