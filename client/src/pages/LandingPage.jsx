import React from 'react';
import { Link } from 'react-router-dom';
import {
  Recycle,
  Sparkles,
  Truck,
  ShieldCheck,
  Gift,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Award,
  Users,
  Compass,
} from 'lucide-react';
import PublicHotspotMap from '../components/common/PublicHotspotMap';

export const LandingPage = () => {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-900 text-primary-700 dark:text-primary-300 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-accent-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Bhopal Smart Waste Initiative • Swachh Survekshan Rank #5 City</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-ink dark:text-white leading-[1.15]">
          Segregate. Track.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500">
            Earn. Recycle.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-muted dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Waste has true value. Join Bhopal's unified circular platform connecting citizens,
          sanitation workers, and municipal authorities with live GPS tracking, verified eco-points,
          and public dump reporting.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-soft-lg transition-all active:scale-95 flex items-center gap-2"
          >
            Start Earning Eco-Points <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-ink dark:text-gray-100 font-bold text-sm border border-gray-200 dark:border-gray-800 shadow-sm transition-all"
          >
            Explore Live Demo Portals
          </Link>
        </div>

        {/* Real context pill stats */}
        <div className="pt-2 text-xs text-muted">
          <span>Final-Year Major Project by SIRTE, Sagar Group of Institutions, Bhopal</span>
        </div>
      </section>

      {/* Live Context & Municipal Stats Strip */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-primary-950 via-primary-900 to-ink text-white shadow-soft-lg">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-300">
            Real Urban Waste Context
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-bold mt-1">
            Why India Needs Kachra Bazar
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {/* India stat */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-accent-400 font-heading block">
              1.7 Lakh
            </span>
            <span className="text-xs font-semibold text-white mt-1 block">
              Tonnes MSW / Day in India
            </span>
            <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
              92% collected, yet processing lags behind due to lack of source segregation.
            </p>
          </div>

          {/* Bhopal stat */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-heading block">
              850 Tonnes
            </span>
            <span className="text-xs font-semibold text-white mt-1 block">
              Daily Garbage in Bhopal
            </span>
            <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
              Generated daily across 85 municipal wards in the City of Lakes.
            </p>
          </div>

          {/* BMC Fleet */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-heading block">
              469 Vehicles
            </span>
            <span className="text-xs font-semibold text-white mt-1 block">
              GPS-Tracked BMC Fleet
            </span>
            <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
              Door-to-door tipper trucks driving Bhopal's #5 Swachh Survekshan national ranking.
            </p>
          </div>
        </div>

        {/* Citations line */}
        <p className="text-center text-[10px] text-gray-400 mt-6 pt-4 border-t border-white/10 font-mono">
          Sources: Central Pollution Control Board (CPCB) Annual Report 2021-22 via CAG Audit; Free Press Journal; Press Information Bureau (PIB).
        </p>
      </section>

      {/* How It Works: 5 Steps */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            End-To-End Circular Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white">
            How Kachra Bazar Works
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            From segregated doorstep waste to real financial rewards for households.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Segregate at Home',
              desc: 'Separate wet organic, dry recyclable, e-waste, and hazardous waste into separate bins.',
              icon: Recycle,
              color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
            },
            {
              step: '02',
              title: 'Track Truck Live',
              desc: 'Watch your ward collection truck move in real-time with dynamic ETA and 500m alerts.',
              icon: Truck,
              color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60',
            },
            {
              step: '03',
              title: 'Worker Verification',
              desc: 'Sanitation workers inspect segregation quality (Correct, Partial, None) at doorstep.',
              icon: ShieldCheck,
              color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
            },
            {
              step: '04',
              title: 'Earn Eco-Points',
              desc: 'Get +20 pts for 100% correct segregation, +30 pts for cleared dump reports, and streak bonuses.',
              icon: Sparkles,
              color: 'text-accent-600 bg-accent-50 dark:bg-accent-950/60',
            },
            {
              step: '05',
              title: 'Redeem at Bazar',
              desc: 'Exchange points for electricity bill subsidies, water tax rebates, composting kits, and shopping bags.',
              icon: Gift,
              color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-black text-2xl text-gray-300 dark:text-gray-700">
                      {item.step}
                    </span>
                    <div className={`p-2.5 rounded-xl ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-ink dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Public Hotspot Map Section */}
      <section id="hotspot-map" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
              Community Accountability
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white">
              Civic Dump Hotspot Tracker
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Live geo-tagged reports submitted by citizens across Bhopal. Notice a hotspot? Report it
              and earn +30 bonus points once cleared!
            </p>
          </div>
          <Link
            to="/register"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" /> Report Hotspot in Your Ward
          </Link>
        </div>

        <PublicHotspotMap />
      </section>

      {/* Why Kachra Bazar Feature Grid */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            A Next-Gen Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white">
            Built for Real Indian Cities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-primary-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink dark:text-white">
              Verified Points, Zero Fraud
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Points are never awarded blindly on request submission. Every pickup requires
              physical inspection by sanitation workers with double-credit protection and an immutable ledger.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink dark:text-white">
              Dynamic Route & Live Fleet Map
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Built on Leaflet and OpenStreetMap tiles with zero paid map keys required.
              Ward-wise Socket.io broadcast delivers truck positions and 500m proximity alerts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-950/60 text-accent-500 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink dark:text-white">
              Real Utility Bill Subsidies
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Partnered with MPPKVVCL electricity and BMC water taxes. Citizens redeem generated
              coupon codes directly against their monthly utility bills.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Project & Team Strip */}
      <section className="rounded-3xl p-6 sm:p-10 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-300 text-xs font-bold border border-primary-200 dark:border-primary-800 shadow-sm">
            <Award className="w-4 h-4 text-accent-500" />
            <span>Final-Year Major Project • 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink dark:text-white">
            Engineering Clean & Green Technology for Bhopal
          </h2>

          <p className="text-xs sm:text-sm text-muted dark:text-gray-300 leading-relaxed">
            Developed by students of <strong>Sagar Institute of Research & Technology - Excellence (SIRTE)</strong>,
            Sagar Group of Institutions, Bhopal. Category: Software • Pilot City: Bhopal Municipal Corporation.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-semibold text-primary-900 dark:text-primary-100">
            <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-800 shadow-sm">
              Sourabh Patel
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-800 shadow-sm">
              Vishal Dhakad
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-800 shadow-sm">
              Rehman Khan
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-800 shadow-sm">
              Zeeshan Ashraf
            </span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center py-6 space-y-4">
        <h2 className="text-3xl font-heading font-black text-ink dark:text-white">
          Ready to Make Bhopal the Cleanest City in India?
        </h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Start segregating today, keep roadside dumps in check, and redeem real rewards from the
          bazar.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Create Citizen Account
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-ink dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Login With Demo Roles
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
