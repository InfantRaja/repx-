import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Flame } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-repx-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background athletic lighting accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-repx-volt/10 via-repx-cyan/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 right-0 w-[400px] h-[400px] bg-repx-crimson/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4FF00 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <NavLink to="/login" className="inline-flex items-center gap-3 group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-repx-900 border border-repx-borderLight p-2 flex items-center justify-center group-hover:border-repx-volt transition-all shadow-volt-glow">
            <img src="/logo.svg" alt="REPX" className="w-full h-full" />
          </div>
          <span className="font-display font-black text-3xl tracking-tight text-white">
            REP<span className="text-repx-volt">X</span>
          </span>
        </NavLink>
        <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
          TRACK • TRAIN • TRANSFORM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="repx-card py-8 px-6 sm:px-10 rounded-3xl border border-repx-borderLight shadow-2xl backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
