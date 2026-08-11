'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  QrCode,
  RefreshCw,
  Clock,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function QRStationPage() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchTodayQR();
  }, []);

  useEffect(() => {
    if (!qrData?.expires_at) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(qrData.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData]);

  const fetchTodayQR = async () => {
    setLoading(true);
    try {
      const res = await api.get('/qr/today');
      setQrData(res.data);
    } catch (err) {
      console.error('Fetch today QR error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewQR = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/qr/generate');
      setQrData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate new QR Code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (qrData?.scan_url) {
      navigator.clipboard.writeText(qrData.scan_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
              <QrCode className="w-5 h-5" />
            </div>
            Attendance QR Broadcast Station
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Display this screen on reception tablet/monitor for staff mobile scanning.</p>
        </div>

        <button
          onClick={handleGenerateNewQR}
          disabled={generating}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Generate New QR Token
        </button>
      </div>

      {/* Main QR Card */}
      <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Broadcast QR Code...</p>
          </div>
        ) : (
          <div className="z-10 w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 font-semibold text-xs mb-6">
              <CheckCircle2 className="w-4 h-4" /> Active Daily Broadcast QR Token
            </div>

            <div className="p-5 bg-white rounded-3xl shadow-lg border-4 border-slate-200 dark:border-slate-800 mb-6 group hover:scale-105 transition-transform duration-300">
              {qrData?.qr_image_base64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrData.qr_image_base64}
                  alt="Attendance Scan QR Code"
                  className="w-72 h-72 object-contain rounded-xl"
                />
              )}
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-300 mb-6 bg-slate-100 dark:bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Token Validity: <span className="text-blue-600 dark:text-blue-400">{timeLeft}</span>
            </div>

            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-left">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Direct Mobile Scan URL</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={qrData?.scan_url || ''}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1 text-xs"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={qrData?.scan_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                  title="Test Scan Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500 max-w-md">
              <p>Staff members scan this QR code with their mobile phone camera. They must authenticate with their staff credentials to complete check-in/out and break tracking.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

