import React from 'react';
import { Award, Flame, Leaf, CloudRain, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import EcoCounter from './EcoCounter';

export const YourWorthCard = ({ summary, loading = false }) => {
  if (loading || !summary) {
    return (
      <div className="rounded-3xl p-6 bg-gradient-to-br from-primary-900 to-primary-700 text-white shadow-soft-lg animate-pulse">
        <div className="h-6 w-36 bg-white/20 rounded mb-4" />
        <div className="h-10 w-24 bg-white/20 rounded mb-6" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    ecoBalance = 0,
    lifetimePoints = 0,
    kgSegregated = 0,
    co2SavedKg = 0,
    streakCount = 0,
    currentTier = { name: 'Bronze', badge: '🥉', color: '#CD7F32' },
    nextTier = { name: 'Silver', minPoints: 100 },
    progressToNext = 0,
  } = summary;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white shadow-soft-lg border border-primary-700/50">
      {/* Background organic wave illustration */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-accent-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-primary-400/10 blur-2xl pointer-events-none" />

      {/* Top row: Label & Tier Badge */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-primary-200">
            Citizen Impact Card
          </span>
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            Your Green Worth
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-xs font-bold text-white">
          <span>{currentTier.badge}</span>
          <span>{currentTier.name} Citizen</span>
        </div>
      </div>

      {/* Main Points Display */}
      <div className="flex flex-wrap items-baseline gap-4 mb-6">
        <div>
          <span className="text-xs text-primary-200 block mb-0.5">Spendable Eco-Balance</span>
          <div className="flex items-center gap-2">
            <EcoCounter value={ecoBalance} size="lg" />
          </div>
        </div>

        <div className="border-l border-white/20 pl-4">
          <span className="text-xs text-primary-200 block mb-0.5">Lifetime Earned</span>
          <span className="text-xl font-bold font-heading text-white">
            {lifetimePoints.toLocaleString()} <span className="text-xs text-primary-300">pts</span>
          </span>
        </div>
      </div>

      {/* Tier Progress Bar */}
      <div className="mb-6 bg-black/20 p-3 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-primary-200">
            Current Tier: <strong className="text-white">{currentTier.name}</strong>
          </span>
          {nextTier ? (
            <span className="text-accent-300">
              {nextTier.minPoints - lifetimePoints > 0
                ? `${nextTier.minPoints - lifetimePoints} pts to ${nextTier.name}`
                : `Max Level Reached`}
            </span>
          ) : (
            <span className="text-accent-300 font-bold">Top Level Member</span>
          )}
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-500 to-amber-300 transition-all duration-700 shadow-sm"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Bottom Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        {/* Waste Segregated */}
        <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
          <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <span className="block text-base font-extrabold text-white">{kgSegregated}</span>
          <span className="text-[10px] text-primary-200 font-medium leading-tight block">
            kg Waste Segregated
          </span>
        </div>

        {/* CO2 Saved */}
        <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
          <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-sky-500/30 flex items-center justify-center text-sky-300">
            <CloudRain className="w-3.5 h-3.5" />
          </div>
          <span className="block text-base font-extrabold text-white">{co2SavedKg}</span>
          <span className="text-[10px] text-primary-200 font-medium leading-tight block">
            kg CO₂ Prevented
          </span>
        </div>

        {/* Streak */}
        <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
          <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-orange-500/30 flex items-center justify-center text-orange-400">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="block text-base font-extrabold text-white">{streakCount}d</span>
          <span className="text-[10px] text-primary-200 font-medium leading-tight block">
            Pickup Streak
          </span>
        </div>
      </div>

      {/* Action link */}
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
        <span className="text-primary-200 text-[11px]">Factor: 1.25 kg CO₂ saved / kg segregated</span>
        <Link
          to="/dashboard/rewards"
          className="inline-flex items-center gap-1 font-bold text-accent-300 hover:text-white transition-colors"
        >
          Redeem at Bazar <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default YourWorthCard;
