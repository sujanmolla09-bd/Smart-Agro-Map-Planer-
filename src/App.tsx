/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import AboutModal from './components/AboutModal';
import MapComponent from './components/MapComponent';
import { Loader2, Info } from 'lucide-react';

export default function App() {
  const getInitialKey = () => {
    const envKey = (typeof process !== 'undefined' && process.env?.GOOGLE_MAPS_API_KEY) || 
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY);
    return envKey || null;
  };

  const [apiKey, setApiKey] = useState<string | null>(getInitialKey);
  const [checking, setChecking] = useState(() => !getInitialKey());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeOverridden, setThemeOverridden] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(true);

  const checkApiKey = async () => {
    const envKey = getInitialKey();
    if (envKey) {
      setApiKey(envKey);
      setChecking(false);
      return true;
    }

    try {
      const res = await fetch('/api/config', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        return false;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Server returned non-JSON (e.g. index.html during boot), skip JSON parsing
        return false;
      }

      const data = await res.json();
      if (data && data.apiKey) {
        setApiKey(data.apiKey);
        return true;
      }
    } catch (error) {
      console.warn('API key check waiting for server:', error);
    } finally {
      setChecking(false);
    }
    return false;
  };

  useEffect(() => {
    checkApiKey();
    
    // Initialize theme from system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleSetDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    setThemeOverridden(true);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Polling for API key if not present
  useEffect(() => {
    if (apiKey) return;

    const interval = setInterval(async () => {
      const found = await checkApiKey();
      if (found) {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [apiKey]);

  const handleApiKeySubmit = async (key: string) => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key }),
    });

    if (res.ok) {
      setApiKey(key);
    } else {
      throw new Error('Failed to save key');
    }
  };

  const handleResetKey = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: '' }),
    });
    setApiKey(null);
  };

  useEffect(() => {
    if (!apiKey) return;
    
    // Places UI Kit components often look for a script tag with a key to initialize.
    // When using dynamic loaders, we can help them by ensuring a script tag exists or 
    // by setting the key in a way they can find.
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript && !existingScript.hasAttribute('key')) {
      existingScript.setAttribute('key', apiKey);
    }
  }, [apiKey]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
      
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white px-4 py-2 text-sm flex items-center justify-between z-50 shadow-xl border-b border-white/10">
        <div className="hidden lg:flex items-center gap-2 font-black text-xs tracking-wide">
          <span className="bg-white/20 px-2 py-0.5 rounded-md font-extrabold">Smart Agro</span>
          <span className="text-emerald-200 font-medium">Thakurgaon Grid</span>
        </div>
        <div className="flex-1 text-center text-[11px] sm:text-xs font-medium tracking-wide">
          <span className="opacity-95">You can power this applet with a <a href="https://developers.google.com/maps/demo-key?utm_source=ai-studio&utm_medium=website&utm_campaign=FY26_Q1_maps-demo-key&utm_content=maps-demo-key_api-key-link" target="_blank" rel="noopener noreferrer" className="underline font-black text-white hover:text-emerald-200 transition-colors">Maps Demo Key</a> with usage and API limits or get a <a href="https://developers.google.com/maps/get-started?utm_source=ai-studio&utm_medium=website&utm_campaign=FY26_Q1_maps-demo-key&utm_content=maps-standard-key_api-key-link" target="_blank" rel="noopener noreferrer" className="underline font-black text-white hover:text-emerald-200 transition-colors">standard API Key</a> for all GMP APIs.</span>
        </div>
        <button 
          onClick={() => setShowAboutModal(true)}
          className="text-[10px] tracking-wide font-black bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-all active:scale-95 ml-3 whitespace-nowrap border border-white/15 flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5" />
          About Smart Agro
        </button>
      </div>
      <div className="flex-1 relative">
        {apiKey ? (
          <MapComponent 
            apiKey={apiKey} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={handleSetDarkMode} 
          />
        ) : !showAboutModal ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md space-y-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <Info className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">API Key Required</h2>
              <p className="text-slate-600 dark:text-slate-400">
                To use the map, please provide a Google Maps API Key in the <span className="font-bold text-indigo-600 dark:text-indigo-400">Secrets</span> panel of AI Studio.
              </p>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-left space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">How to set it up:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li><span className="font-semibold">Remix</span> this app</li>
                  <li>Open the <span className="font-semibold">Settings menu</span> and select the <span className="font-semibold">Secrets</span> tab</li>
                  <li>Add a new secret named <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GOOGLE_MAPS_API_KEY</code></li>
                  <li>Paste your Google Maps API Key as the value</li>
                </ol>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-2 italic">
                  The app will automatically detect the key and refresh once added.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
        )}
      </div>
    </div>
  );
}

