"use client"

import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from 'next/link';

export default function GmailSimulationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState('idle');
  const [ticketId, setTicketId] = useState(null);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('submitting');
    
    try {
      const response = await fetch('http://localhost:8000/api/support/gmail/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Simulation failed');
      }
      
      const data = await response.json();
      setTicketId(data.ticket_id);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };
  
  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl mt-12 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Email Sent!</h2>
        <p className="text-slate-400">Your simulated Gmail message has been received by the AI.</p>
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Simulation ID</p>
          <p className="text-xl font-mono font-bold text-rose-400">{ticketId}</p>
        </div>
        <p className="text-sm text-slate-500">
          The AI will process this as an inbound email and reply to <strong>{formData.email}</strong>.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all"
        >
          Send Another Email
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-rose-500/20 shadow-xl mt-12 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Simulation Failed</h2>
        <p className="text-slate-400">We encountered an error while trying to simulate the email.</p>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
          <p className="text-xs text-rose-500 uppercase tracking-wider mb-2">Error Details</p>
          <p className="text-sm font-mono text-rose-200">{error}</p>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Link href="/support" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Support
      </Link>

      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">
          <Mail className="h-4 w-4" />
          Gmail Simulation
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Send an Email</h1>
        <p className="text-slate-400 text-lg">Test how the AI agent handles inbound Gmail messages.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Gmail Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            placeholder="your-email@gmail.com"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-slate-300">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            placeholder="Email Subject"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-slate-300">Message (Email Body) *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            placeholder="Write your email here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Simulated Email'
          )}
        </button>
      </form>
    </div>
  );
}
