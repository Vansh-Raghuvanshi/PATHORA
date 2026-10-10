'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Layers,
  BarChart3,
  GitCompare,
  Sparkles,
  Code2,
  HelpCircle,
  Bookmark,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  PlusCircle,
  Share2,
  CheckCircle2,
  RotateCcw,
  User,
} from 'lucide-react';
import { getActiveRoadmap, resetToDemoRoadmap } from '@/lib/roadmap-storage';
import { CareerRoadmap } from '@/types/roadmap';
import GlobalSearch from '@/components/common/GlobalSearch';
import ExportShareModal from '@/components/workspace/ExportShareModal';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    setRoadmap(getActiveRoadmap());

    const handleUpdate = (e: CustomEvent<CareerRoadmap>) => {
      setRoadmap(e.detail || getActiveRoadmap());
    };
    window.addEventListener('pathora-roadmap-updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    return () => {
      window.removeEventListener('pathora-roadmap-updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    };
  }, []);

  const navLinks = [
    { name: 'My Roadmap', href: '/roadmap', icon: Layers, badge: roadmap ? `${roadmap.nodes.length}` : undefined },
    { name: 'Create New Roadmap', href: '/generator', icon: PlusCircle },
    { name: 'Saved Roadmaps', href: '/saved', icon: Bookmark },
  ];

  const handleResetDemo = () => {
    const demo = resetToDemoRoadmap();
    setRoadmap(demo);
    router.push('/roadmap');
  };

  return (
    <div className="flex h-screen w-full bg-[#fbfbfa] text-slate-900 overflow-hidden font-sans">
      {/* Desktop Narrow / Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
              P
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">PATHORA</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">CAREER OS</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: Active Target & Reset Demo */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Active Career Goal
                </span>
                <span className="text-xs font-bold text-slate-900 truncate block">
                  {roadmap?.target.role || 'Career Target'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {roadmap?.target.companyType || 'Product Company'}
                </span>
              </div>

              <button
                onClick={handleResetDemo}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Reload the verified demonstration roadmap"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reload Demo Roadmap</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleResetDemo}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Reload Demo Roadmap"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shrink-0 z-20">
          {/* Left: Mobile Menu Trigger + Breadcrumb / Active Goal */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <Link href="/roadmap" className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                {roadmap?.target.role || 'Career Roadmap'}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-medium hidden sm:inline">
                {pathname === '/roadmap'
                  ? 'Interactive Graph'
                  : pathname === '/generator'
                  ? 'Generator'
                  : pathname.replace('/', '').replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right: Search, Actions, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search milestones...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Export & Share CTA */}
            {roadmap && (
              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                title="Share or Export this roadmap"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* Build New Roadmap CTA */}
            <Link
              href="/generator"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Path</span>
            </Link>

            {/* Student Profile Indicator */}
            <div
              className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold"
              title="Student Mode"
            >
              ST
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-y-auto relative bg-[#fbfbfa]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">PATHORA</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Search Dialog Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Export & Share Modal */}
      {roadmap && (
        <ExportShareModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          roadmap={roadmap}
        />
      )}
    </div>
  );
}

