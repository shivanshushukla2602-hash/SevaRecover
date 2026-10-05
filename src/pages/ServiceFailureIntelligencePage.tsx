import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, AlertOctagon, Cpu, Layers, ChevronDown, Copy, Check, ThumbsUp, MapPin, Database, GraduationCap, Leaf, FileText } from 'lucide-react';
import { MOCK_INTELLIGENCE_DATA } from '../data/mock-data';
import { FailureCategoryDonutChart } from '../components/FailureCategoryDonutChart';
import { getStats, StatsResponse } from '../services/api-client';

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const title = label || payload[0].name || payload[0].payload?.state || payload[0].payload?.domain || payload[0].payload?.month || '';
    const val = payload[0].value;
    const unit = payload[0].payload?.friction !== undefined ? '%' : '';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[#0A0A0B] text-[#F2F1EC] border border-[rgba(34,197,94,0.4)] shadow-[0_12px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(34,197,94,0.25)] rounded-xl p-3 text-xs space-y-1 z-50 pointer-events-none"
      >
        <p className="font-bold text-[#22C55E]">{title}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]" />
          <span className="text-[#A8ABB3] font-medium">Metric:</span>
          <span className="font-mono font-extrabold text-[#F2F1EC]">
            {typeof val === 'number' ? val.toLocaleString() : val}{unit}
          </span>
        </div>
      </motion.div>
    );
  }
  return null;
};

const AnimatedPercent = ({ value }: { value: number }) => {
  const [displayVal, setDisplayVal] = useState(0);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        const duration = 1200;
        const startTime = performance.now();
        const updateNumber = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = progress * (2 - progress);
          setDisplayVal(value * easeProgress);
          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          }
        };
        requestAnimationFrame(updateNumber);
      }}
    >
      {displayVal.toFixed(1)}% volume
    </motion.span>
  );
};

export const ServiceFailureIntelligencePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [expandedPatterns, setExpandedPatterns] = useState<string[]>([]);
  const [liveStats, setLiveStats] = useState<StatsResponse | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Like Counter State - properly initialized per pattern
  const [priorityVotes, setPriorityVotes] = useState<Record<string, number>>({
    'Post-March Income Certificate Expiration Wave': 48,
    'Initial Mismatch in MahaBhulekh 7/12 Extracts': 35,
    'Institutional Verification Timeouts': 29,
  });
  const [copiedFixes, setCopiedFixes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getStats()
      .then((data) => setLiveStats(data))
      .catch(() => setStatsError('Unable to load live service intelligence. Please retry.'));
  }, []);

  const timeSeriesData = [
    { month: 'Apr 25', count: 1200 },
    { month: 'May 25', count: 1850 },
    { month: 'Jun 25', count: 2400 },
    { month: 'Jul 25', count: 3100 },
    { month: 'Aug 25', count: 4200 },
    { month: 'Sep 25', count: 5410 },
  ];

  const domainComparisonData = [
    { domain: 'Scholarships', failures: 5410 },
    { domain: 'Farmer Schemes', failures: 4120 },
    { domain: 'Public Certs', failures: 2890 },
  ];

  const regionalData = [
    { state: 'Karnataka', friction: 32 },
    { state: 'Maharashtra', friction: 27 },
    { state: 'Madhya Pradesh', friction: 23 },
    { state: 'Delhi UT', friction: 18 },
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const toggleExpandPattern = (title: string) => {
    if (expandedPatterns.includes(title)) {
      setExpandedPatterns(expandedPatterns.filter((t) => t !== title));
    } else {
      setExpandedPatterns([...expandedPatterns, title]);
    }
  };

  const handleCopyFix = (title: string, fixText: string) => {
    navigator.clipboard.writeText(fixText);
    setCopiedFixes({ ...copiedFixes, [title]: true });
    setTimeout(() => {
      setCopiedFixes((prev) => ({ ...prev, [title]: false }));
    }, 2000);
  };

  // Fixed Like Handler: Increments smoothly from current value without dropping
  const handleUpvote = (title: string, currentVal: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityVotes((prev) => {
      const baseCount = prev[title] !== undefined ? prev[title] : currentVal;
      return {
        ...prev,
        [title]: baseCount + 1,
      };
    });
  };

  const filteredPatterns = MOCK_INTELLIGENCE_DATA.emergingPatterns.filter((pat) => {
    if (severityFilter !== 'ALL' && pat.severity.toUpperCase() !== severityFilter) {
      return false;
    }
    if (selectedCategory) {
      return (
        pat.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        pat.description.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.includes('mismatch') ||
        selectedCategory.includes('Expired')
      );
    }
    return true;
  });

  return (
    <div className="ds-shell py-8 sm:py-12 space-y-8 text-[#F2F1EC]">
      {statsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-300" role="alert">
          {statsError}
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 border-b border-[rgba(34,197,94,0.2)] pb-5 min-w-0">
        <div className="min-w-0 max-w-full">
          <div className="flex items-center gap-2">
            <span className="eyebrow">POLICY SIGNALS / LIVE INDEX</span>
            <h1 className="mt-2 text-4xl sm:text-5xl font-heading font-extrabold text-[#F2F1EC] break-words">
              Service <span className="gold-text">Failure Intelligence</span>
            </h1>
            <span className="hidden sm:inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
              AGGREGATE VIEW
            </span>
          </div>
          <p className="text-sm text-[#9A9A9E] mt-2">
            Aggregate failure pattern monitoring for state policy officers, department directors, and public auditors.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#A8ABB3] bg-[#141416] px-3 py-2 rounded-xl border border-[rgba(34,197,94,0.2)]">
          <Cpu className="w-4 h-4 text-[#22C55E]" />
          <span>OpenSearch Index: sevarecover-analytics</span>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#141416] border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] rounded-2xl p-5 space-y-2 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="text-[11px] font-bold text-[#A8ABB3] uppercase tracking-wider">Total Applications Analyzed</span>
          <div className="font-heading font-extrabold text-3xl text-[#22C55E]">
            {(liveStats?.total_analyzed || MOCK_INTELLIGENCE_DATA.totalAnalyzed).toLocaleString()}
          </div>
          <p className="text-[11px] text-[#7A9B7E] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14% volume from last quarter</span>
          </p>
        </div>

        <div className="bg-[#141416] border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] rounded-2xl p-5 space-y-2 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="text-[11px] font-bold text-[#A8ABB3] uppercase tracking-wider">Documented Recoveries</span>
          <div className="font-heading font-extrabold text-3xl text-[#7A9B7E]">
            {MOCK_INTELLIGENCE_DATA.successfulRecoveries.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#A8ABB3] font-medium">90.4% Successful Recovery Rate</p>
        </div>

        <div className="bg-[#141416] border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] rounded-2xl p-5 space-y-2 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="text-[11px] font-bold text-[#A8ABB3] uppercase tracking-wider">Avg Resolution Window</span>
          <div className="font-heading font-extrabold text-3xl text-[#22C55E]">
            {MOCK_INTELLIGENCE_DATA.avgResolutionDays}
          </div>
          <p className="text-[11px] text-[#A8ABB3] font-medium">Down from 18 days traditional grievance</p>
        </div>

        <div className="bg-[#141416] border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] rounded-2xl p-5 space-y-2 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="text-[11px] font-bold text-[#A8ABB3] uppercase tracking-wider">Top Failure Driver</span>
          <div className="font-heading font-extrabold text-xl text-red-400 leading-tight">
            Expired Income Proof
          </div>
          <p className="text-[11px] text-red-400 font-medium">36.5% of total rejections</p>
        </div>
      </div>

      {/* Grid: FailureCategoryDonutChart & Time Series AreaChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FailureCategoryDonutChart onCategorySelect={handleCategorySelect} />

        {/* AreaChart with Centered Layout & Custom Theme Tooltip */}
        <div className="relative overflow-hidden bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-4 transition-all group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(34,197,94,0.03)] to-transparent pointer-events-none rounded-2xl opacity-60 animate-pulse" />
          <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              <h3 className="font-heading font-bold text-base text-[#F2F1EC]">
                Application Rejection Trends Over Time
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2 py-0.5 rounded">
              Live Feed
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center p-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.1)" />
                <XAxis dataKey="month" stroke="#A8ABB3" fontSize={11} tickMargin={8} />
                <YAxis stroke="#A8ABB3" fontSize={11} tickMargin={6} />
                <RechartsTooltip content={<CustomChartTooltip />} cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '3 3' }} wrapperStyle={{ outline: 'none' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#22C55E" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={100}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART 1: "Where Friction Clusters" — Geographic State Heat Matrix with Location Pins & Heat Scale */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-[#141416] border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-5 transition-all group"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header & Heat Intensity Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(34,197,94,0.15)] pb-4 relative z-10">
          <div>
            <span className="eyebrow">REGIONAL SIGNAL ANALYSIS</span>
            <h3 className="mt-1 text-xl font-heading font-bold text-[#F2F1EC] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#22C55E]" />
              Where friction clusters
            </h3>
          </div>

          {/* Friction Heat Scale Gradient Legend */}
          <div className="flex items-center gap-2 bg-[#0A0A0B] px-3 py-1.5 rounded-xl border border-[rgba(34,197,94,0.2)]">
            <span className="text-[10px] font-bold text-[#A8ABB3] uppercase">Heat Scale:</span>
            <div className="flex items-center gap-1 font-mono text-[10px] text-[#A8ABB3]">
              <span>15%</span>
              <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[#22C55E]/40 via-[#22C55E] to-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
              <span className="text-[#22C55E] font-bold">35%</span>
            </div>
          </div>
        </div>

        {/* 2x2 Geographic State Heat Tile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 pt-1">
          {[
            {
              state: 'Karnataka',
              friction: 32,
              status: 'Critical Friction Zone',
              badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
              pinBg: 'bg-[#22C55E] text-[#0A0A0B]',
              tileBorder: 'border-[#22C55E]/50 hover:border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.15)]',
              heatOpacity: 'from-[#22C55E]/20 via-[#22C55E]/10 to-transparent',
              signalText: 'High income certificate & portal timeout rate',
            },
            {
              state: 'Maharashtra',
              friction: 27,
              status: 'High Friction Zone',
              badgeColor: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
              pinBg: 'bg-[#22C55E] text-[#0A0A0B]',
              tileBorder: 'border-[#22C55E]/40 hover:border-[#22C55E]',
              heatOpacity: 'from-[#22C55E]/15 via-[#22C55E]/5 to-transparent',
              signalText: 'Land 7/12 extract spelling discrepancies',
            },
            {
              state: 'Madhya Pradesh',
              friction: 23,
              status: 'Moderate Friction Zone',
              badgeColor: 'bg-[#D9A74A]/15 text-[#22C55E] border-[#D9A74A]/30',
              pinBg: 'bg-[#D9A74A] text-[#0A0A0B]',
              tileBorder: 'border-[#D9A74A]/35 hover:border-[#D9A74A]',
              heatOpacity: 'from-[#D9A74A]/15 via-transparent to-transparent',
              signalText: 'Institutional verification processing bottleneck',
            },
            {
              state: 'Delhi UT',
              friction: 18,
              status: 'Elevated Friction Zone',
              badgeColor: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
              pinBg: 'bg-[#22C55E] text-[#0A0A0B]',
              tileBorder: 'border-[#22C55E]/30 hover:border-[#22C55E]',
              heatOpacity: 'from-[#22C55E]/10 via-transparent to-transparent',
              signalText: 'Gazette affidavit compliance format errors',
            },
          ].map((tile, idx) => (
            <motion.div
              key={tile.state}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`relative overflow-hidden bg-[#0A0A0B] p-4 rounded-xl border transition-all cursor-pointer group/tile space-y-3 ${tile.tileBorder}`}
            >
              {/* Background Heat Glow Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.heatOpacity} pointer-events-none opacity-80`} />

              {/* Top Row: Pin Badge & Friction Percentage */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg ${tile.pinBg} font-extrabold text-xs flex items-center justify-center shadow-md relative`}>
                    <MapPin className="w-4 h-4 fill-current stroke-none" />
                    {idx === 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]"></span>
                      </span>
                    )}
                  </span>
                  <div>
                    <h4 className="font-heading font-extrabold text-base text-[#F2F1EC] group-hover/tile:text-[#22C55E] transition-colors leading-tight">
                      {tile.state}
                    </h4>
                    <span className="text-[10px] text-[#A8ABB3] font-mono">
                      State Signal Node #{idx + 1}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-extrabold text-2xl text-[#22C55E] block leading-none">
                    {tile.friction}%
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold text-[#A8ABB3]">
                    Friction Rate
                  </span>
                </div>
              </div>

              {/* Status Badge & Signal Description */}
              <div className="relative z-10 pt-2 border-t border-[rgba(34,197,94,0.15)] flex items-center justify-between gap-2">
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border shrink-0 ${tile.badgeColor}`}>
                  {tile.status}
                </span>
                <p className="text-[10px] text-[#A8ABB3] leading-tight text-right truncate">
                  {tile.signalText}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CHART 2: "Failure Rate Volume Across Core Domains" — Icon-Driven Volume Gauge Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.25)] hover:border-[#22C55E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4 transition-all group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-3 relative z-10">
          <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#22C55E]" />
            Failure Rate Volume Across Core Domains
          </h3>
          <span className="text-[10px] font-extrabold uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2.5 py-1 rounded-md">
            Volume Share
          </span>
        </div>

        {/* Domain Icon Cards with High-Impact Volume Numbers & Gold-Hierarchy Progress Gauges */}
        <div className="space-y-3.5 relative z-10 pt-1">
          {[
            {
              domain: 'Scholarships',
              failures: 5410,
              percentage: 43.6,
              icon: <GraduationCap className="w-4 h-4 text-[#22C55E]" />,
              badgeBg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]',
              barColor: 'bg-gradient-to-r from-[#22C55E] via-[#22C55E] to-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.4)]',
              glowColor: 'hover:border-[#22C55E] hover:shadow-[0_8px_25px_rgba(34,197,94,0.2)]',
            },
            {
              domain: 'Farmer Schemes',
              failures: 4120,
              percentage: 33.2,
              icon: <Leaf className="w-4 h-4 text-[#22C55E]" />,
              badgeBg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 shadow-[0_0_8px_rgba(227,197,120,0.15)]',
              barColor: 'bg-gradient-to-r from-[#B08937] via-[#22C55E] to-[#22C55E] shadow-[0_0_8px_rgba(227,197,120,0.35)]',
              glowColor: 'hover:border-[#22C55E] hover:shadow-[0_8px_25px_rgba(227,197,120,0.2)]',
            },
            {
              domain: 'Public Certs',
              failures: 2890,
              percentage: 23.2,
              icon: <FileText className="w-4 h-4 text-[#22C55E]" />,
              badgeBg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
              barColor: 'bg-gradient-to-r from-[#85611E] via-[#A67E2D] to-[#22C55E] shadow-[0_0_6px_rgba(34,197,94,0.3)]',
              glowColor: 'hover:border-[#22C55E] hover:shadow-[0_8px_25px_rgba(34,197,94,0.2)]',
            },
          ].map((item, idx) => (
            <motion.div 
              key={item.domain}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`bg-[#0A0A0B] border border-[rgba(34,197,94,0.15)] p-3.5 rounded-xl space-y-2.5 transition-all group/domain shadow-sm cursor-pointer ${item.glowColor}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#141416] border border-[rgba(34,197,94,0.25)] flex items-center justify-center group-hover/domain:scale-110 group-hover/domain:border-[#22C55E] transition-all shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-[#F2F1EC] group-hover/domain:text-[#22C55E] transition-colors block">
                      {item.domain}
                    </span>
                    <span className="text-[10px] text-[#A8ABB3] font-mono">
                      {item.failures.toLocaleString()} applications logged
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${item.badgeBg}`}>
                  <AnimatedPercent value={item.percentage} />
                </span>
              </div>

              {/* Gauge Progress Bar */}
              <div className="h-2.5 w-full bg-[#141416] rounded-full p-0.5 border border-[rgba(34,197,94,0.1)] relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(item.failures / 5410) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: idx * 0.18, ease: 'easeOut' }}
                  className={`h-full rounded-full ${item.barColor} relative`}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full blur-[1px]" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Emerging Pattern Callouts — 3D Flip Card Interaction */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(34,197,94,0.15)] pb-3">
          <h3 className="font-heading font-bold text-base text-[#F2F1EC] flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#22C55E]" />
            Emerging Systemic Patterns & Policy Recommendations
          </h3>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#141416] p-1 rounded-xl border border-[rgba(34,197,94,0.25)]">
            <span className="text-[10px] font-bold text-[#A8ABB3] uppercase px-2">Severity:</span>
            {['ALL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-[#22C55E] text-[#0A0A0B] shadow-sm font-extrabold'
                    : 'text-[#A8ABB3] hover:text-[#F2F1EC]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div className="flex items-center justify-between bg-[#22C55E]/15 p-3 rounded-xl border border-[#22C55E]/30 text-xs text-[#22C55E]">
            <span>Filtered by Donut Category: <strong>{selectedCategory}</strong></span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[#22C55E] font-bold hover:underline text-[11px]"
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPatterns.map((pat, idx) => {
            const isHigh = pat.severity.toUpperCase() === 'HIGH';
            const isExpanded = expandedPatterns.includes(pat.title);
            const metrics = pat.metric;
            
            const initialCount = idx === 0 ? 35 : 48;
            const voteCount = priorityVotes[pat.title] !== undefined ? priorityVotes[pat.title] : initialCount;
            const isCopied = copiedFixes[pat.title] || false;

            return (
              <div key={pat.title} className="relative min-h-[260px] [perspective:1000px] group">
                <motion.div
                  initial={false}
                  animate={{ rotateY: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full h-full relative [transform-style:preserve-3d] rounded-2xl"
                >
                  {/* FRONT FACE */}
                  <div
                    onClick={() => toggleExpandPattern(pat.title)}
                    className="absolute inset-0 [backface-visibility:hidden] bg-[#141416] border border-[#22C55E]/30 hover:border-[#22C55E] border-l-4 border-l-[#22C55E] rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between relative z-10 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                            isHigh ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                          }`}
                        >
                          {isHigh && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                          {pat.severity} SEVERITY PATTERN
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleUpvote(pat.title, initialCount, e)}
                        title="Flag as Priority for Administrative Review"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F2F1EC] bg-[#0A0A0B] hover:bg-[#22C55E]/20 hover:text-[#22C55E] px-2.5 py-1 rounded-lg border border-[#22C55E]/30 transition-colors shadow-sm cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>{voteCount}</span>
                      </button>
                    </div>

                    {/* Headline Number Callout */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading font-extrabold text-3xl text-[#22C55E]">
                          {metrics.count}
                        </span>
                        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-mono border border-red-500/20">
                          {metrics.trend}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-base text-[#F2F1EC] group-hover:text-[#22C55E] transition-colors">
                        {pat.title}
                      </h4>
                      <p className="text-xs text-[#9A9A9E] leading-relaxed line-clamp-2">
                        {pat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[rgba(34,197,94,0.15)] flex items-center justify-between text-xs font-bold text-[#22C55E]">
                      <span>Why this policy pattern? (Flip for proposal 🔄)</span>
                      <ChevronDown className="w-4 h-4 text-[#22C55E] -rotate-90" />
                    </div>
                  </div>

                  {/* BACK FACE (FLIPPED POLICY PROPOSAL) */}
                  <div
                    className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1C1C1F] border-2 border-[#22C55E] rounded-2xl p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(34,197,94,0.25)] overflow-hidden space-y-3"
                  >
                    <div className="space-y-2.5 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/15 px-2.5 py-0.5 rounded-md border border-[#22C55E]/30">
                          Administrative Policy Proposal
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleExpandPattern(pat.title)}
                          className="text-xs font-bold text-[#A8ABB3] hover:text-[#F2F1EC] bg-[#141416] px-2 py-0.5 rounded-lg border border-[rgba(34,197,94,0.2)] transition-colors cursor-pointer"
                        >
                          ← Back to summary
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#A8ABB3] uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#22C55E]" /> Affected States:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {metrics.states.map((st) => (
                            <span key={st} className="px-2 py-0.5 rounded bg-[#0A0A0B] text-[#F2F1EC] text-[10px] font-bold border border-[rgba(34,197,94,0.2)]">
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#22C55E]/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[#22C55E] uppercase text-[10px] font-extrabold">
                            Suggested Fix:
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyFix(pat.title, pat.suggestedPolicyFix);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#22C55E] hover:text-[#F2F1EC] bg-[#141416] px-2 py-0.5 rounded-md border border-[#22C55E]/30 transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-[#7A9B7E]" /> : <Copy className="w-3 h-3 text-[#22C55E]" />}
                            <span>{isCopied ? 'Copied!' : 'Copy Fix'}</span>
                          </button>
                        </div>
                        <p className="font-medium text-xs text-[#F2F1EC] leading-relaxed">
                          {pat.suggestedPolicyFix}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#A8ABB3] font-mono pt-1 border-t border-[rgba(34,197,94,0.15)]">
                      <Database className="w-3 h-3 text-[#7A9B7E]" />
                      <span>Data Source: OpenSearch sevarecover-analytics</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceFailureIntelligencePage;
