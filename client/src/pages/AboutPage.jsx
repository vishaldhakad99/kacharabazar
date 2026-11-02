import React from 'react';
import { Award, BookOpen, Recycle, ShieldCheck, MapPin, Sparkles, Heart } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-800 dark:text-primary-300 text-xs font-bold">
          <Award className="w-4 h-4 text-accent-500" />
          <span>Final-Year Major Project • 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-ink dark:text-white">
          About Kachra Bazar
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          A smart municipal waste management & verified incentive platform designed for Indian cities,
          piloted in Bhopal, Madhya Pradesh.
        </p>
      </div>

      {/* The Name & Philosophy */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink dark:text-white flex items-center gap-2">
          <Recycle className="w-5 h-5 text-primary-600" />
          The Philosophy: "Waste Has Value"
        </h2>
        <p className="text-xs sm:text-sm text-muted dark:text-gray-300 leading-relaxed">
          The name <strong>"Kachra Bazar"</strong> blends <em>"Kachra"</em> (waste) with <em>"Bazar"</em> (marketplace).
          In conventional urban chains, waste collection is a one-way path ending in overflowing landfills.
          Citizens cannot see when waste is picked up or where it goes. Workers use fixed routes and phone calls,
          so citizen requests reach them late. Authorities rely on monthly reports with no live data.
        </p>
        <p className="text-xs sm:text-sm text-muted dark:text-gray-300 leading-relaxed">
          <strong>Kachra Bazar transforms this dynamic</strong>: Waste has real economic and civic value. Citizens earn
          verifiable eco-points for 100% correct source segregation (wet vs dry vs hazardous), and redeem those
          points for municipal electricity and water tax subsidies, composting kits, and local store vouchers.
        </p>
      </section>

      {/* Ground Truth & Bhopal Context */}
      <section className="p-6 sm:p-8 rounded-3xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900 space-y-4">
        <h2 className="text-xl font-heading font-bold text-primary-950 dark:text-primary-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent-500" />
          Pilot City Context: Bhopal, Madhya Pradesh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-primary-100 dark:border-gray-800">
            <span className="text-xl font-black text-primary-700 dark:text-primary-300 font-heading block">
              1.7 Lakh T/Day
            </span>
            <span className="text-xs font-semibold text-ink dark:text-white mt-1 block">
              National MSW Generation
            </span>
            <p className="text-[11px] text-muted mt-1">
              CPCB 2021-22 via CAG audit: ~92% collected but processing lags behind.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-primary-100 dark:border-gray-800">
            <span className="text-xl font-black text-emerald-600 font-heading block">
              850 Tonnes/Day
            </span>
            <span className="text-xs font-semibold text-ink dark:text-white mt-1 block">
              Bhopal Garbage Output
            </span>
            <p className="text-[11px] text-muted mt-1">
              Collected daily across 85 municipal wards in the City of Lakes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-primary-100 dark:border-gray-800">
            <span className="text-xl font-black text-accent-500 font-heading block">
              469 GPS Vehicles
            </span>
            <span className="text-xs font-semibold text-ink dark:text-white mt-1 block">
              BMC Collection Fleet
            </span>
            <p className="text-[11px] text-muted mt-1">
              Ranked 5th nationwide in Swachh Survekshan 2023.
            </p>
          </div>
        </div>
      </section>

      {/* Project Authors & Institute Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-ink dark:text-white">
              Project Development Team
            </h2>
            <p className="text-xs text-muted">
              Sagar Institute of Research & Technology - Excellence (SIRTE), Bhopal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 block mb-1">
              Student Engineers
            </span>
            <ul className="text-xs font-semibold text-ink dark:text-gray-100 space-y-1">
              <li>• Sourabh Patel</li>
              <li>• Vishal Dhakad</li>
              <li>• Rehman Khan</li>
              <li>• Zeeshan Ashraf</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 block mb-1">
              Academic Details
            </span>
            <p className="text-xs font-semibold text-ink dark:text-gray-100">
              Institute: SIRTE, Sagar Group of Institutions, Bhopal
            </p>
            <p className="text-xs text-muted mt-1">
              Theme: Clean & Green Technology
            </p>
            <p className="text-xs text-muted">
              Category: Software Engineering
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
