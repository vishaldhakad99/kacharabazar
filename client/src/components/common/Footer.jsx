import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Heart, Shield, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Vision */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Recycle className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="font-heading font-black text-lg text-ink dark:text-white">
                Kachra <span className="text-accent-500">Bazar</span>
              </span>
            </div>
            <p className="text-xs text-muted dark:text-gray-400 max-w-sm leading-relaxed">
              Transforming urban solid waste management into a value-driven circular ecosystem for
              Indian cities. Pilot project deployed in partnership with Bhopal municipal wards.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-primary-700 dark:text-primary-400 font-semibold pt-1">
              <Award className="w-4 h-4 text-accent-500" />
              <span>Theme: Clean & Green Technology • Category: Software</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-ink dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted dark:text-gray-400">
              <li>
                <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
                  Home Landing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400">
                  About Project & Team
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-600 dark:hover:text-primary-400">
                  Citizen Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-600 dark:hover:text-primary-400">
                  Sanitation Worker App
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-600 dark:hover:text-primary-400">
                  Municipal Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Authors / Academic Team */}
          <div>
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-ink dark:text-white mb-3">
              Project Developers
            </h4>
            <p className="text-xs font-bold text-ink dark:text-white mb-1">Final-Year Major Project</p>
            <p className="text-xs text-muted dark:text-gray-400 leading-relaxed mb-2">
              Sourabh Patel, Vishal Dhakad, Rehman Khan, Zeeshan Ashraf
            </p>
            <p className="text-[11px] font-semibold text-primary-800 dark:text-primary-300">
              SIRTE, Sagar Group of Institutions, Bhopal (MP)
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted dark:text-gray-500 gap-3">
          <p>
            © {new Date().getFullYear()} Kachra Bazar. Built for Swachh Bhopal & Indian Smart Cities.
          </p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> at SIRTE Bhopal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
