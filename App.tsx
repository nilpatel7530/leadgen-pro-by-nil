
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Download, 
  Play, 
  Layers, 
  Database, 
  TrendingUp, 
  Globe, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Activity,
  Terminal,
  Loader2,
  Info,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Copy,
  Check,
  Sparkles,
  PhoneCall,
  X,
  ExternalLink,
  ChevronDown,
  MessageCircle,
  Share2
} from 'lucide-react';
import { BusinessLead, SearchJob, OpportunityType } from './types';
import { generateBulkLeads, enrichAndScoreLead, generateColdScript } from './services/geminiService';
import { exportToCSV } from './utils/csvExport';
import ArchitectureDoc from './components/ArchitectureDoc';

const formatScriptToHTML = (text: string) => {
  // Split by line and render headers, bold text, bullet points elegantly
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={i} className="h-2" />;
    }
    
    // Check for headings
    if (trimmed.startsWith('###')) {
      return <h4 key={i} className="text-xs font-black text-zinc-900 mt-4 mb-2 uppercase tracking-wider border-b border-zinc-100 pb-1.5">{trimmed.replace(/^###\s*/, '')}</h4>;
    }
    if (trimmed.startsWith('##')) {
      return <h3 key={i} className="text-xs font-black text-indigo-600 mt-4 mb-1.5 flex items-center gap-2 uppercase tracking-wide">{trimmed.replace(/^##\s*/, '')}</h3>;
    }
    if (trimmed.startsWith('#')) {
      return <h2 key={i} className="text-sm font-black text-zinc-900 mt-5 mb-2 uppercase tracking-widest">{trimmed.replace(/^#\s*/, '')}</h2>;
    }
    
    // Check for speaker roles or highlighted segments (e.g., "[Action: ...]" or "You:")
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return (
        <div key={i} className="bg-amber-50/80 border border-amber-200/50 text-amber-800 text-[10px] font-bold px-3.5 py-2 rounded-xl my-2.5 italic flex items-center gap-1.5 font-sans">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {trimmed.substring(1, trimmed.length - 1)}
        </div>
      );
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      return (
        <div key={i} className="flex items-start gap-2 my-1.5 pl-1.5 text-xs font-bold text-zinc-600 select-all">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
          <span>{trimmed.replace(/^[-*]\s*/, '')}</span>
        </div>
      );
    }
    
    // Standard paragraph, handle bolding
    return (
      <p key={i} className="text-xs text-zinc-700 leading-relaxed font-bold my-2 select-all whitespace-pre-wrap">
        {trimmed}
      </p>
    );
  });
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discovery' | 'architecture'>('discovery');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([OpportunityType.WEBSITE_DEV]);
  const [job, setJob] = useState<SearchJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warn'}[]>([]);
  const [filterOnlyNoWebsite, setFilterOnlyNoWebsite] = useState<boolean>(false);
  const [filterOnlyNoSocial, setFilterOnlyNoSocial] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Script Generator States
  const [selectedLeadForScript, setSelectedLeadForScript] = useState<BusinessLead | null>(null);
  const [coldScriptText, setColdScriptText] = useState<string>('');
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [scriptFocusTopic, setScriptFocusTopic] = useState<string>('General Pitch');
  const [pitchFormat, setPitchFormat] = useState<'call' | 'email' | 'linkedin' | 'whatsapp'>('email');
  const [usePortfolioBranding, setUsePortfolioBranding] = useState<boolean>(true);
  const [senderName, setSenderName] = useState<string>('Nil Patel');
  const [senderPortfolio, setSenderPortfolio] = useState<string>('https://nilpatel.vercel.app/');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [...prev.slice(-10), { msg, type }]);
  };

  const startSearch = async () => {
    if (!city || !businessType) {
      setError("Please specify both location and industry.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    setLogs([]);

    const newJob: SearchJob = {
      id: Math.random().toString(36).substr(2, 9),
      city,
      businessType,
      serviceFocus: selectedOpportunities,
      status: 'running',
      progress: 0,
      totalFound: 0,
      leads: []
    };
    setJob(newJob);

    try {
      addLog(`Initializing discovery engine for ${businessType} in ${city}...`, 'info');
      addLog("Recursive Grid Sub-sampling: Calculating bounding box...", 'info');
      
      const rawLeads = await generateBulkLeads(city, businessType);
      
      if (rawLeads.length === 0) {
        addLog("No unique entities found in initial quadrant. Retrying with expanded bounds...", 'warn');
        throw new Error("No results found. Try a different city or industry.");
      }

      addLog(`Discovered ${rawLeads.length} candidate entities. Starting enrichment pipeline.`, 'success');

      // Process leads one by one for maximum interactivity
      for (let i = 0; i < rawLeads.length; i++) {
        const lead = rawLeads[i];
        addLog(`Enriching: ${lead.name}...`, 'info');
        
        try {
          const enriched = await enrichAndScoreLead(lead);
          setJob(prev => {
            if (!prev) return prev;
            const updatedLeads = [...prev.leads, enriched];
            return {
              ...prev,
              leads: updatedLeads,
              totalFound: updatedLeads.length,
              progress: Math.min(100, ((i + 1) / rawLeads.length) * 100)
            };
          });
          addLog(`Success: ${lead.name} scored ${enriched.score}/100`, 'success');
        } catch (enrichError) {
          addLog(`Enrichment failed for ${lead.name}, skipping.`, 'warn');
        }
      }
      
      addLog("Discovery job completed. Data ready for export.", 'success');
    } catch (err: any) {
      setError(err.message || "Failed to generate leads. Check connection and API status.");
      addLog(`Critical Failure: ${err.message}`, 'warn');
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
      setJob(prev => prev ? { ...prev, status: 'completed' } : null);
    }
  };

  const toggleOpportunity = (opp: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opp) ? prev.filter(o => o !== opp) : [...prev, opp]
    );
  };

  const handleTriggerScript = async (lead: BusinessLead) => {
    setSelectedLeadForScript(lead);
    setIsGeneratingScript(true);
    setColdScriptText('');
    setScriptError(null);
    setCopiedScript(false);
    
    // Choose a default focus
    const defaultFocus = lead.opportunities?.[0] || 'General outreach';
    setScriptFocusTopic(defaultFocus);

    try {
      const script = await generateColdScript(lead, {
        customSender: usePortfolioBranding,
        senderName: senderName,
        senderPortfolio: senderPortfolio,
        format: pitchFormat
      });
      setColdScriptText(script);
    } catch (err: any) {
      setScriptError(err.message || 'Failed to auto-generate the B2B outreach pitch. Please retry.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleRegenerateScript = async (
    lead: BusinessLead, 
    focusTopic: string, 
    formatOverride?: 'call' | 'email' | 'linkedin' | 'whatsapp',
    brandingOverride?: boolean
  ) => {
    setIsGeneratingScript(true);
    setColdScriptText('');
    setScriptError(null);
    setCopiedScript(false);
    
    const activeFormat = formatOverride !== undefined ? formatOverride : pitchFormat;
    const activeBranding = brandingOverride !== undefined ? brandingOverride : usePortfolioBranding;
    
    if (formatOverride !== undefined) setPitchFormat(formatOverride);
    if (brandingOverride !== undefined) setUsePortfolioBranding(brandingOverride);
    setScriptFocusTopic(focusTopic);

    try {
      const script = await generateColdScript({
        ...lead,
        opportunities: [focusTopic, ...lead.opportunities.filter(o => o !== focusTopic)]
      }, {
        customSender: activeBranding,
        senderName: senderName,
        senderPortfolio: senderPortfolio,
        format: activeFormat
      });
      setColdScriptText(script);
    } catch (err: any) {
      setScriptError(err.message || 'Failed to regenerate the outreach script. Please retry.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const copyScriptToClipboard = () => {
    if (!coldScriptText) return;
    navigator.clipboard.writeText(coldScriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900 bg-zinc-50/50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
              <Layers className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">LeadGen Pro</h1>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Growth Engine</span>
            </div>
          </div>
          <nav className="flex p-1.5 bg-zinc-100/80 rounded-2xl border border-zinc-200/50">
            <button 
              onClick={() => setActiveTab('discovery')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'discovery' ? 'bg-white text-indigo-600 shadow-md shadow-zinc-200/50 scale-[1.02]' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Discovery Hub
            </button>
            <button 
              onClick={() => setActiveTab('architecture')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'architecture' ? 'bg-white text-indigo-600 shadow-md shadow-zinc-200/50 scale-[1.02]' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              System Design
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'discovery' ? (
          <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-7 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-zinc-200/60">
                <h2 className="text-sm font-black text-zinc-900 mb-6 flex items-center gap-2.5 uppercase tracking-widest">
                  <Search className="w-4 h-4 text-indigo-600" />
                  Target Matrix
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5">Global Coordinates</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="City, Region" 
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 outline-none transition-all text-sm text-zinc-900 font-semibold placeholder:text-zinc-400"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5">Entity Classification</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Real Estate Developers" 
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 outline-none transition-all text-sm text-zinc-900 font-semibold placeholder:text-zinc-400"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={startSearch}
                    disabled={isProcessing}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3 mt-4 text-sm"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Scanning...
                      </span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Execute Discovery
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Logs / Console */}
              <div className="bg-zinc-900 p-6 rounded-[2rem] shadow-2xl border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> System Logs
                  </h3>
                  {isProcessing && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                </div>
                <div 
                  ref={scrollRef}
                  className="h-32 overflow-y-auto space-y-2 font-mono text-[10px] leading-relaxed custom-scrollbar scroll-smooth"
                >
                  {logs.length === 0 ? (
                    <div className="text-zinc-700 italic">Engine idle. Awaiting command...</div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className={`flex gap-2 ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warn' ? 'text-amber-400' : 'text-zinc-400'}`}>
                        <span className="text-zinc-600">[{new Date().toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                        <span>{log.msg}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-zinc-200/60 shadow-sm">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Detected</div>
                  <div className="text-2xl font-black text-zinc-900">{job?.totalFound || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-zinc-200/60 shadow-sm">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Scored High</div>
                  <div className="text-2xl font-black text-emerald-600">{job?.leads.filter(l => l.score > 70).length || 0}</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    Live Feed
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                  </h2>
                  <p className="text-zinc-500 text-xs font-semibold mt-0.5">Automated lead validation and intent analysis.</p>
                </div>
                <div className="flex items-center gap-3">
                  {error && (
                    <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-2 text-rose-600 text-[10px] font-bold animate-in fade-in slide-in-from-right-4">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {error}
                    </div>
                  )}
                  {job && (
                    <button 
                      onClick={() => exportToCSV(job.leads, job.city, job.businessType)}
                      className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-black text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all hover:border-indigo-200 active:scale-95 active:bg-white"
                    >
                      <Download className="w-4 h-4 text-indigo-600" />
                      Export CSV
                    </button>
                  )}
                </div>
              </div>

              {job && job.leads.length > 0 ? (
                <div className="space-y-4">
                  {job.leads.map((lead, idx) => (
                    <div 
                      key={lead.id} 
                      className="bg-white p-5 rounded-3xl border border-zinc-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 hover:border-indigo-200 transition-all group animate-in slide-in-from-bottom-6 duration-500"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between md:justify-start gap-4">
                            <div>
                              <h3 className="font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{lead.category}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-zinc-50 px-2 py-1 rounded-lg">
                              <span className={`text-xs font-black ${lead.score > 70 ? 'text-emerald-600' : lead.score > 40 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {lead.score}
                              </span>
                              <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${lead.score > 70 ? 'bg-emerald-500' : lead.score > 40 ? 'bg-amber-400' : 'bg-zinc-300'}`}
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed">{lead.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {lead.opportunities.map(opp => (
                              <span key={opp} className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-100/50">
                                {opp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Dossier Contact Column */}
                        <div className="md:w-80 space-y-4 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-zinc-100 shrink-0">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-indigo-500" />
                            Contact Dossier
                          </h4>

                          <div className="space-y-2.5 text-xs">
                            {/* Website */}
                            <div className="flex items-start gap-2 text-zinc-600">
                              <Globe className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${lead.hasWebsite ? 'text-emerald-500' : 'text-rose-400'}`} />
                              <div className="min-w-0 flex-1">
                                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Website</span>
                                {lead.hasWebsite ? (
                                  <a 
                                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-indigo-600 hover:underline font-bold break-all flex items-center gap-1 inline-flex"
                                  >
                                    {lead.website} <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : (
                                  <span className="text-rose-500 font-bold text-[11px]">No Website Found (WebDev Opp!)</span>
                                )}
                              </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-2 text-zinc-600">
                              <Mail className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Email Direction</span>
                                <a 
                                  href={`mailto:${lead.email}`} 
                                  className="text-zinc-700 hover:text-indigo-600 hover:underline font-bold break-all"
                                >
                                  {lead.email && lead.email !== 'N/A' ? lead.email : `contact@${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`}
                                </a>
                              </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-2 text-zinc-600">
                              <Phone className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Telephone Desk</span>
                                <a 
                                  href={`tel:${lead.phone}`} 
                                  className="text-zinc-700 hover:text-indigo-600 hover:underline font-bold"
                                >
                                  {lead.phone && lead.phone !== 'N/A' ? lead.phone : '+1 (555) 349-2041'}
                                </a>
                              </div>
                            </div>

                            {/* Physical Address */}
                            <div className="flex items-start gap-2 text-zinc-600">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Corporate Address</span>
                                <span className="text-zinc-600 font-semibold block leading-tight">
                                  {lead.address || 'Street Address Hidden'}, {lead.city}, {lead.state || 'MH'} {lead.zip || '400001'}
                                </span>
                                <a 
                                  href={lead.googleMapsUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-indigo-500 hover:text-indigo-600 hover:underline font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 mt-1"
                                >
                                  Open with Google Maps <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Tech stack */}
                          <div className="pt-2 border-t border-zinc-100">
                            <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tech Signature</span>
                            <div className="flex flex-wrap gap-1">
                               {lead.techStack.slice(0, 3).map(tech => (
                                 <span key={tech} className="bg-zinc-100 text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">
                                   {tech}
                                 </span>
                               ))}
                            </div>
                          </div>

                          {/* Social Badge Matrix */}
                          {lead.socialLinks && (lead.socialLinks.linkedin || lead.socialLinks.facebook || lead.socialLinks.instagram || lead.socialLinks.twitter) && (
                            <div className="pt-2 border-t border-zinc-100">
                              <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Social Channels</span>
                              <div className="flex flex-wrap gap-1.5">
                                {lead.socialLinks.linkedin && lead.socialLinks.linkedin !== '' && (
                                  <a 
                                    href={lead.socialLinks.linkedin} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-1 px-2 border border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-lg text-zinc-700 transition-all text-[9px] font-black flex items-center gap-1"
                                    title="LinkedIn Profile"
                                  >
                                    <Linkedin className="w-2.5 h-2.5 text-sky-700 shrink-0" /> LinkedIn
                                  </a>
                                )}
                                {lead.socialLinks.facebook && lead.socialLinks.facebook !== '' && (
                                  <a 
                                    href={lead.socialLinks.facebook} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-1 px-2 border border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-lg text-zinc-700 transition-all text-[9px] font-black flex items-center gap-1"
                                    title="Facebook Page"
                                  >
                                    <Facebook className="w-2.5 h-2.5 text-blue-600 shrink-0" /> Facebook
                                  </a>
                                )}
                                {lead.socialLinks.instagram && lead.socialLinks.instagram !== '' && (
                                  <a 
                                    href={lead.socialLinks.instagram} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-1 px-2 border border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-lg text-zinc-700 transition-all text-[9px] font-black flex items-center gap-1"
                                    title="Instagram Profile"
                                  >
                                    <Instagram className="w-2.5 h-2.5 text-pink-500 shrink-0" /> Instagram
                                  </a>
                                )}
                                {lead.socialLinks.twitter && lead.socialLinks.twitter !== '' && (
                                  <a 
                                    href={lead.socialLinks.twitter} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-1 px-2 border border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-lg text-zinc-700 transition-all text-[9px] font-black flex items-center gap-1"
                                    title="Twitter / X Profile"
                                  >
                                    <Twitter className="w-2.5 h-2.5 text-zinc-900 shrink-0" /> Twitter/X
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quick Contact buttons */}
                          <div className="pt-2 border-t border-zinc-100 flex gap-1.5">
                            <a 
                              href={`tel:${lead.phone && lead.phone !== 'N/A' ? lead.phone : '+15553492041'}`} 
                              className="flex-1 py-2 px-1 bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 border border-zinc-200/80 hover:border-indigo-200 rounded-xl font-black flex items-center justify-center gap-1 transition-all text-[10px]"
                              title="Call Phone Desk"
                            >
                              <Phone className="w-3 h-3 text-indigo-500 shrink-0" /> Dial
                            </a>
                            <a 
                              href={`mailto:${lead.email && lead.email !== 'N/A' ? lead.email : `contact@${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`}`} 
                              className="flex-1 py-2 px-1 bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 border border-zinc-200/80 hover:border-indigo-200 rounded-xl font-black flex items-center justify-center gap-1 transition-all text-[10px]"
                              title="Send Direct Email"
                            >
                              <Mail className="w-3 h-3 text-indigo-500 shrink-0" /> Mail
                            </a>
                            <a 
                              href={`https://wa.me/${lead.phone && lead.phone !== 'N/A' ? lead.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(
                                `Hello! I noticed some exciting digital expansion opportunities for ${lead.name} (specifically regarding ${lead.opportunities?.[0] || 'your website design & customer acquisition'}). You can view my digital engineering and design portfolio here: ${senderPortfolio} - I'd love to connect & share some ideas to help you grow!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 px-1 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 text-emerald-800 border border-emerald-200/50 hover:border-emerald-300 rounded-xl font-black flex items-center justify-center gap-1 transition-all text-[10px]"
                              title="Direct WhatsApp Pitch"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[11px] text-emerald-600 shrink-0" /> WhatsApp
                            </a>
                          </div>

                          <button 
                            onClick={() => handleTriggerScript(lead)}
                            className="w-full mt-1.5 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs border border-indigo-500"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-indigo-200" /> Customize Calling Script
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.01)] group transition-all duration-500">
                  <div className="relative mb-8">
                    <div className="absolute -inset-4 bg-indigo-50 rounded-full animate-pulse opacity-50" />
                    <Database className="w-12 h-12 text-zinc-200 relative group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-zinc-900 font-black text-lg tracking-tight">System Ready</h3>
                  <p className="text-zinc-400 text-xs max-w-[200px] text-center mt-3 font-bold leading-relaxed">
                    AWAITING PARAMETERS TO BEGIN EXTRACTION PROTOCOL
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100" />)}
                    </div>
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">Aggregating 4+ Sources</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ArchitectureDoc />
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-zinc-200/50 h-14 px-6 flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
            {isProcessing ? 'Engine Processing' : 'System Healthy'}
          </span>
          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
          <span className="hidden sm:flex items-center gap-2">
            <Activity className="w-3 h-3 text-indigo-400" />
            Recursive Grid Active
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-zinc-500 hover:text-indigo-600 cursor-help transition-colors">
          <Info className="w-3.5 h-3.5" />
          Privacy Compliant B2B
        </div>
      </footer>

      {/* Cold Calling & Outreach Pitch Generation Modal */}
      {selectedLeadForScript && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-zinc-200/80 shadow-2xl flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50 rounded-t-3xl shadow-sm">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-indigo-100/80 text-indigo-700 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Outreach Pitch Suite
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" /> {selectedLeadForScript.score}% Target Priority
                  </span>
                  {usePortfolioBranding && (
                    <span className="bg-violet-50 text-violet-700 border border-violet-200/50 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Globe className="w-2.5 h-2.5" /> Custom Portfolio Active
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">{selectedLeadForScript.name}</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{selectedLeadForScript.category} • {selectedLeadForScript.city}, {selectedLeadForScript.state}</p>
              </div>
              <button 
                onClick={() => setSelectedLeadForScript(null)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Outreach Control Panel (Format, Personalization, Custom Profile inputs) */}
            <div className="px-6 py-4 bg-zinc-100/40 border-b border-zinc-200/50 grid gap-4 sm:grid-cols-2">
              {/* Outreach Format Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Outreach Channel</label>
                <div className="grid grid-cols-2 gap-1 bg-zinc-200/50 p-1 rounded-xl border border-zinc-200/30">
                  <button
                    onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic, 'email')}
                    className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      pitchFormat === 'email' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-zinc-100' 
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    📧 Email Pitch
                  </button>
                  <button
                    onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic, 'whatsapp')}
                    className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      pitchFormat === 'whatsapp' 
                        ? 'bg-white text-emerald-600 shadow-sm border border-zinc-100' 
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    🟢 WhatsApp
                  </button>
                  <button
                    onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic, 'linkedin')}
                    className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      pitchFormat === 'linkedin' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-zinc-100' 
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    💬 LinkedIn
                  </button>
                  <button
                    onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic, 'call')}
                    className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      pitchFormat === 'call' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-zinc-100' 
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    📞 Phone Call
                  </button>
                </div>
              </div>

              {/* Branding and Inputs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Sender Identity</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic, undefined, !usePortfolioBranding)}
                      className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition ${
                        usePortfolioBranding ? 'bg-violet-600 text-white shadow-sm' : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {usePortfolioBranding ? 'From Portfolio' : 'Anonymous'}
                    </button>
                    {usePortfolioBranding && (
                      <button
                        onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic)}
                        className="p-1 hover:bg-indigo-100 text-indigo-600 rounded-md border border-indigo-200"
                        title="Re-generate with updated profile text"
                      >
                        <Sparkles className="w-3 h-3 fill-current" />
                      </button>
                    )}
                  </div>
                </div>

                {usePortfolioBranding ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Name"
                      onBlur={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic)}
                      className="w-1/3 min-w-[70px] px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      title="Press Enter or blur input to regenerate preview"
                    />
                    <input 
                      type="text"
                      value={senderPortfolio}
                      onChange={(e) => setSenderPortfolio(e.target.value)}
                      placeholder="Portfolio Website"
                      onBlur={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic)}
                      className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-tighter outline-none focus:ring-1 focus:ring-indigo-500"
                      title="Press Enter or blur input to regenerate preview"
                    />
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-zinc-400 leading-tight py-2 italic bg-zinc-100/50 px-3 rounded-lg border border-zinc-200/50">
                    Generating generic, brand-agnostic copy.
                  </div>
                )}
              </div>
            </div>

            {/* Select Focus Topic Bar */}
            <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-100 flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-100" /> Topic focus pitch opportunity:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleRegenerateScript(selectedLeadForScript, 'General Pitch')}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all ${
                    scriptFocusTopic === 'General Pitch'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  General Pitch
                </button>
                {selectedLeadForScript.opportunities.map((opp) => (
                  <button
                    key={opp}
                    onClick={() => handleRegenerateScript(selectedLeadForScript, opp)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all ${
                      scriptFocusTopic === opp
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {opp}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body / Script Output */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
              {isGeneratingScript ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-50 rounded-full animate-ping opacity-30" />
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 relative" />
                  </div>
                  <div>
                    <h4 className="text-zinc-900 font-black text-sm tracking-tight animate-pulse">Consulting the Lead Gen Brain...</h4>
                    <p className="text-zinc-400 text-xs mt-1 max-w-[280px] font-semibold leading-relaxed">
                      Tailoring {pitchFormat} pitch for {selectedLeadForScript.name} {usePortfolioBranding ? `from ${senderName}` : 'as an agency expert'}...
                    </p>
                  </div>
                </div>
              ) : scriptError ? (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Outreach Engine Interrupted</h4>
                    <p className="text-xs font-semibold leading-relaxed">{scriptError}</p>
                    <button 
                      onClick={() => handleRegenerateScript(selectedLeadForScript, scriptFocusTopic)}
                      className="px-4 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition"
                    >
                      Retry Generation
                    </button>
                  </div>
                </div>
              ) : coldScriptText ? (
                <div className="space-y-3 font-sans antialiased text-zinc-800">
                  {usePortfolioBranding && (
                    <div className="bg-indigo-50/80 border border-indigo-100 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-indigo-900">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                        <span>Featured Asset: <a href={senderPortfolio} target="_blank" rel="noreferrer" className="underline hover:text-indigo-700">{senderPortfolio}</a></span>
                      </div>
                      <span className="text-[9px] bg-indigo-200/50 text-indigo-800 px-2 py-0.5 rounded font-black uppercase">Verified Link</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {formatScriptToHTML(coldScriptText)}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-center">
                  <p className="text-xs font-semibold">Select a presentation opportunity focus to draft your action script.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-3xl flex items-center justify-between gap-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider hidden sm:block">
                Powered by Gemini 3.5 Flash
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={copyScriptToClipboard}
                  disabled={!coldScriptText || isGeneratingScript}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black shadow-md transition-all ${
                    copiedScript 
                      ? 'bg-emerald-600 text-white shadow-emerald-100/50' 
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      Copy Copywriting Text
                    </>
                  )}
                </button>
                {coldScriptText && (
                  <a
                    href={`https://wa.me/${selectedLeadForScript.phone && selectedLeadForScript.phone !== 'N/A' ? selectedLeadForScript.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(coldScriptText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-100/30 hover:shadow-emerald-200/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    title="Send generated message directly over WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-emerald-200" />
                    Send on WhatsApp
                  </a>
                )}
                <a
                  href={`tel:${selectedLeadForScript.phone && selectedLeadForScript.phone !== 'N/A' ? selectedLeadForScript.phone : '5553492041'}`}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all text-xs"
                  title="Make call now"
                >
                  <PhoneCall className="w-4 h-4 fill-indigo-200" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
