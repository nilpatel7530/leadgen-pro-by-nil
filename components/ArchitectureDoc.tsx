
import React from 'react';
import { Server, Zap, Shield, Share2, Grid, Database, Target } from 'lucide-react';

const ArchitectureDoc: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 space-y-16">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
            <Server className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">System Infrastructure</h2>
            <p className="text-zinc-500 font-medium">Production-grade distributed discovery engine.</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-zinc-100 hover:border-indigo-100 transition-colors">
            <h3 className="font-bold text-xl mb-5 text-indigo-600 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Intelligence Layer
            </h3>
            <ul className="space-y-4 text-zinc-600 font-medium text-sm">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                React 18 / TypeScript Core
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                LLM-Driven Lead Scoring
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                Real-time Webhook Streaming
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                Local Persistence Caching
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-zinc-100 hover:border-emerald-100 transition-colors">
            <h3 className="font-bold text-xl mb-5 text-emerald-600 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Pipeline
            </h3>
            <ul className="space-y-4 text-zinc-600 font-medium text-sm">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                Node.js Scalable Workers
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                Redis Task Orchestration
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                PostgreSQL Relational Sync
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                ElasticSearch Deduplication
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-zinc-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-zinc-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Grid className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Share2 className="text-indigo-400 w-6 h-6" />
            Recursive Grid Discovery
          </h2>
          <p className="text-zinc-400 font-medium mb-10 max-w-2xl leading-relaxed">
            Standard discovery methods often hit artificial API caps. Our system utilizes 
            <span className="text-white font-bold px-1.5 py-0.5 bg-zinc-800 rounded">Geographic Sub-sampling</span> 
            to ensure 100% coverage of any metropolitan area.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="bg-indigo-600 text-white font-black rounded-2xl h-10 w-10 flex items-center justify-center shadow-lg shadow-indigo-500/20">1</div>
              <p className="font-bold text-sm">Initial Bounds</p>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">System generates a bounding box covering the entire target region.</p>
            </div>
            <div className="space-y-3">
              <div className="bg-indigo-600 text-white font-black rounded-2xl h-10 w-10 flex items-center justify-center shadow-lg shadow-indigo-500/20">2</div>
              <p className="font-bold text-sm">Density Analysis</p>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">If result density exceeds API limits, the region is split into 4 quadrants.</p>
            </div>
            <div className="space-y-3">
              <div className="bg-indigo-600 text-white font-black rounded-2xl h-10 w-10 flex items-center justify-center shadow-lg shadow-indigo-500/20">3</div>
              <p className="font-bold text-sm">Recursion Exit</p>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">Scraping concludes only when all sub-regions yield complete datasets.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-zinc-900 p-2.5 rounded-2xl shadow-lg">
            <Target className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Scoring Logic</h2>
            <p className="text-zinc-500 font-medium text-sm">Rule-based heuristics for identifying service demand.</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-zinc-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <table className="min-w-full divide-y divide-zinc-100">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Signal</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Weight</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Strategic Impact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-50 text-sm">
              <tr>
                <td className="px-8 py-5 font-bold text-zinc-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  Website Absence
                </td>
                <td className="px-8 py-5 font-black text-indigo-600">+40 pts</td>
                <td className="px-8 py-5 text-zinc-500 font-medium">Primary target for digital presence sales.</td>
              </tr>
              <tr>
                <td className="px-8 py-5 font-bold text-zinc-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Legacy Tech Stack
                </td>
                <td className="px-8 py-5 font-black text-amber-600">+25 pts</td>
                <td className="px-8 py-5 text-zinc-500 font-medium">Outdated WordPress or non-responsive frameworks.</td>
              </tr>
              <tr>
                <td className="px-8 py-5 font-bold text-zinc-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  No Automation
                </td>
                <td className="px-8 py-5 font-black text-emerald-600">+20 pts</td>
                <td className="px-8 py-5 text-zinc-500 font-medium">Retailers without e-commerce or booking portals.</td>
              </tr>
              <tr>
                <td className="px-8 py-5 font-bold text-zinc-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  Social Inactivity
                </td>
                <td className="px-8 py-5 font-black text-rose-600">+15 pts</td>
                <td className="px-8 py-5 text-zinc-500 font-medium">Low engagement signals across FB/IG/LinkedIn.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ArchitectureDoc;
