"use client"

import React, { useState } from 'react';
import { Smartphone, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from 'next/link';

export default function WhatsAppSimulationForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
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
      const response = await fetch('http://localhost:8000/api/support/whatsapp/submit', {
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
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Message Sent!</h2>
        <p className="text-slate-400">Your simulated WhatsApp message has been received by the AI.</p>
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Simulation ID</p>
          <p className="text-xl font-mono font-bold text-emerald-400">{ticketId}</p>
        </div>
        <p className="text-sm text-slate-500">
          The AI will process this as a WhatsApp message and reply to <strong>{formData.phone}</strong>.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all"
        >
          Send Another Message
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
          <Smartphone className="h-4 w-4" />
          WhatsApp Simulation
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">WhatsApp Message</h1>
        <p className="text-slate-400 text-lg">Test how the AI agent handles inbound WhatsApp messages.</p>
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
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-slate-300">WhatsApp Number *</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="+1234567890"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-slate-300">Message Content *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            placeholder="Write your WhatsApp message here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Simulated WhatsApp'
          )}
        </button>
      </form>
    </div>
  );
}
