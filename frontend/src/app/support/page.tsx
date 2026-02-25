"use client"

import React, { useState } from 'react';
import { ShieldCheck, LifeBuoy, Loader2, CheckCircle2, Smartphone, Mail } from "lucide-react"

const CATEGORIES = [
  { value: 'general', label: 'General Question' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Inquiry' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feedback', label: 'Feedback' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low - Not urgent' },
  { value: 'medium', label: 'Medium - Need help soon' },
  { value: 'high', label: 'High - Urgent issue' }
];

export default function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [ticketId, setTicketId] = useState(null);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.subject.trim().length < 5) {
      setError('Please enter a subject (at least 5 characters)');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setError('Please describe your issue in more detail (at least 10 characters)');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setStatus('submitting');
    
    try {
      const response = await fetch('http://localhost:8000/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Submission failed');
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
        <h2 className="text-3xl font-bold text-white">Thank You!</h2>
        <p className="text-slate-400">Your support request has been submitted successfully.</p>
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Your Ticket ID</p>
          <p className="text-xl font-mono font-bold text-indigo-400">{ticketId}</p>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          Our AI assistant will respond to your email within 5 minutes.<br />
          For urgent issues, responses are prioritized automatically.
        </p>
        <button
          onClick={() => {
            setStatus('idle');
            setFormData({ name: '', email: '', subject: '', category: 'general', priority: 'medium', message: '' });
          }}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          Submit Another Request
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
          <LifeBuoy className="h-4 w-4" />
          Support Portal
        </div>
        <h1 className="text-4xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-slate-400 text-lg">Fill out the form below and our AI-powered support team will get back to you shortly.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/50 transition-all">
          <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
            <Smartphone className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-white">WhatsApp Support</h3>
            <p className="text-sm text-slate-400">Message +1 415 523 8886</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-mono">Code: join swung-morning</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 group hover:border-rose-500/50 transition-all">
          <div className="p-3 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
            <Mail className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="font-bold text-white">Email Support</h3>
            <p className="text-sm text-slate-400">support@novasaas.com</p>
            <p className="text-[10px] text-rose-500 mt-1">24/7 AI-Powered replies</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-300">Your Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="john@example.com"
            />
          </div>
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
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Brief description of your issue"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-slate-300">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium text-slate-300">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              {PRIORITIES.map(pri => (
                <option key={pri.value} value={pri.value}>{pri.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="message" className="text-sm font-medium text-slate-300">How can we help? *</label>
            <span className="text-xs text-slate-500">{formData.message.length}/1000</span>
          </div>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            placeholder="Please describe your issue or question in detail..."
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Support Request'
          )}
        </button>
        
        <div className="flex items-center justify-center gap-6 text-slate-500 text-xs">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Secure SSL
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> GDPR Compliant
          </div>
        </div>
      </form>
    </div>
  );
}
