"use client"

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Cpu, Globe, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/health');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch status", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 md:mb-12">
        <div className="p-3 bg-indigo-500/10 rounded-2xl">
          <Settings className="h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-slate-400">Manage your Digital FTE configuration and monitor system health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* System Health Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              System Health
            </h2>
            <button 
              onClick={fetchStatus}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['database', 'gmail', 'whatsapp', 'web_form'].map((key) => {
              const isOk = status?.channels?.[key] === 'connected' || status?.channels?.[key] === 'active' || status?.channels?.[key] === 'healthy';
              return (
                <div key={key} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1 truncate">{key}</p>
                  <div className="flex items-center gap-2">
                    {loading ? (
                       <div className="h-2 w-12 bg-slate-700 animate-pulse rounded" />
                    ) : (
                      <>
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${isOk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`text-sm font-medium truncate ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {status?.channels?.[key] || 'offline'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Configuration Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Cpu className="h-5 w-5 text-indigo-400" />
            AI Provider
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div>
                <p className="text-white font-medium text-sm md:text-base">OpenAI (Primary)</p>
                <p className="text-xs text-slate-500">Currently using gpt-4o-mini</p>
              </div>
              <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase">
                Active
              </div>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-200/80">
                To switch providers or update keys, please modify your <strong>.env</strong> file and restart the worker service.
              </p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-indigo-400" />
            Security & Governance
          </h2>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-medium">Data Retention</p>
                {isEditingPolicy ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="number" 
                      value={retentionDays} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRetentionDays(parseInt(e.target.value))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                    />
                    <span className="text-sm text-slate-500">days</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Conversations are stored for {retentionDays} days.</p>
                )}
              </div>
              <button 
                onClick={() => setIsEditingPolicy(!isEditingPolicy)}
                className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
              >
                {isEditingPolicy ? 'Save Policy' : 'Edit Policy'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Automated Escalation</p>
                <p className="text-sm text-slate-500">Triggered on sentiment &lt; 0.3 or keyword match.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase">
                Enabled
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
