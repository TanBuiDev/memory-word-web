import { Crown, Award, Medal } from 'lucide-react';
import type { LeaderboardUser } from '../types';

interface PodiumProps {
    topUsers: LeaderboardUser[];
    timeFrame: 'weekly' | 'allTime';
}

export default function Podium({ topUsers, timeFrame }: PodiumProps) {
    const getXP = (user: LeaderboardUser) => 
        timeFrame === 'weekly' ? user.stats.weeklyXP : user.stats.totalXP;

    const first = topUsers[0];
    const second = topUsers[1];
    const third = topUsers[2];

    return (
        <div className="flex items-end justify-center gap-4 mb-8 px-4">
            {/* Second Place (Left) */}
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
                {second ? (
                    <>
                        <div className="relative mb-2">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 border-4 border-gray-400 flex items-center justify-center shadow-lg">
                                {second.photoURL ? (
                                    <img
                                        src={second.photoURL}
                                        alt={second.displayName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-600">
                                        {second.displayName[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full p-1.5 shadow-md">
                                <Medal className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-md rounded-2xl p-4 w-full border border-gray-300/60 shadow-lg">
                            <div className="text-center">
                                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                                    Rank 2
                                </div>
                                <div className="font-bold text-gray-800 truncate mb-1">
                                    {second.displayName}
                                </div>
                                <div className="text-lg font-bold text-gray-700">
                                    {getXP(second).toLocaleString()} XP
                                </div>
                            </div>
                        </div>
                        <div className="h-16 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg w-full mt-2"></div>
                    </>
                ) : (
                    <div className="h-16 bg-gray-100 rounded-t-lg w-full"></div>
                )}
            </div>

            {/* First Place (Center) */}
            <div className="flex flex-col items-center flex-1 max-w-[160px]">
                {first ? (
                    <>
                        <div className="relative mb-2 animate-bounce-slow">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 border-4 border-yellow-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                {first.photoURL ? (
                                    <img
                                        src={first.photoURL}
                                        alt={first.displayName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-yellow-800">
                                        {first.displayName[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-transparent"></div>
                            </div>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-2 shadow-xl animate-bounce-slow">
                                <Crown className="h-6 w-6 text-yellow-800" fill="currentColor" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50/90 to-yellow-100/90 backdrop-blur-md rounded-2xl p-4 w-full border-2 border-yellow-400/60 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-transparent"></div>
                            <div className="text-center relative z-10">
                                <div className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">
                                    Rank 1
                                </div>
                                <div className="font-bold text-gray-900 truncate mb-1">
                                    {first.displayName}
                                </div>
                                <div className="text-xl font-bold text-yellow-700">
                                    {getXP(first).toLocaleString()} XP
                                </div>
                            </div>
                        </div>
                        <div className="h-24 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg w-full mt-2 shadow-lg"></div>
                    </>
                ) : (
                    <div className="h-24 bg-gray-100 rounded-t-lg w-full"></div>
                )}
            </div>

            {/* Third Place (Right) */}
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
                {third ? (
                    <>
                        <div className="relative mb-2">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border-4 border-amber-500 flex items-center justify-center shadow-lg">
                                {third.photoURL ? (
                                    <img
                                        src={third.photoURL}
                                        alt={third.displayName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-amber-700">
                                        {third.displayName[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-1.5 shadow-md">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/80 backdrop-blur-md rounded-2xl p-4 w-full border border-amber-300/60 shadow-lg">
                            <div className="text-center">
                                <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                                    Rank 3
                                </div>
                                <div className="font-bold text-gray-800 truncate mb-1">
                                    {third.displayName}
                                </div>
                                <div className="text-lg font-bold text-amber-700">
                                    {getXP(third).toLocaleString()} XP
                                </div>
                            </div>
                        </div>
                        <div className="h-12 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-lg w-full mt-2"></div>
                    </>
                ) : (
                    <div className="h-12 bg-gray-100 rounded-t-lg w-full"></div>
                )}
            </div>
        </div>
    );
}

