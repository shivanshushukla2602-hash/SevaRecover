import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, GraduationCap, FileText, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface ServiceSelectionProps {
  onSelectDomain?: (domain: 'farmer' | 'scholarship' | 'certificate') => void;
}

export default function ServiceSelection({ onSelectDomain }: ServiceSelectionProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const services = [
    {
      id: 'farmer' as const,
      title: t('farmerTitle'),
      description: t('farmerDesc'),
      icon: <Leaf className="w-8 h-8" />,
      image: '/farmer-service.svg',
      tag: t('farmerTag'),
      rationaleTitle: t('farmerRatTitle'),
      rationaleText: t('farmerRatText'),
    },
    {
      id: 'scholarship' as const,
      title: t('scholarshipTitle'),
      description: t('scholarshipDesc'),
      icon: <GraduationCap className="w-8 h-8" />,
      image: '/scholarship-service.svg',
      tag: t('scholarshipTag'),
      rationaleTitle: t('scholarshipRatTitle'),
      rationaleText: t('scholarshipRatText'),
    },
    {
      id: 'certificate' as const,
      title: t('certificateTitle'),
      description: t('certificateDesc'),
      icon: <FileText className="w-8 h-8" />,
      image: '/certificate-service.svg',
      tag: t('certificateTag'),
      rationaleTitle: t('certificateRatTitle'),
      rationaleText: t('certificateRatText'),
    },
  ];

  const handleSelect = (domainId: 'farmer' | 'scholarship' | 'certificate') => {
    if (onSelectDomain) {
      onSelectDomain(domainId);
    }
    navigate(`/analyze/${domainId}/describe`, { state: { service: domainId } });
  };

  const toggleFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="ds-shell py-8 sm:py-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-[#A8ABB3] hover:text-[#22C55E] mb-10 transition-colors cursor-pointer text-xs font-semibold"
      >
        <ArrowLeft size={16} /> {t('backToHome')}
      </button>

      <div className="mb-10 grid lg:grid-cols-[1.1fr_.9fr] items-end gap-8">
        <div>
          <span className="eyebrow">{t('selectServiceStep')}</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-heading font-extrabold text-[#F2F1EC] leading-none">
            {t('selectServiceHeading')} <span className="gold-text">{t('selectServiceHeadingGold')}</span>
          </h2>
        </div>
        <p className="text-[#9A9A9E] text-sm leading-relaxed max-w-md lg:pb-1">
          {t('selectServiceSubText')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {services.map((service) => {
          const isFlipped = !!flippedCards[service.id];

          return (
            <div key={service.id} className="relative min-h-[340px] [perspective:1000px] group">
              <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-full relative [transform-style:preserve-3d] rounded-2xl"
              >
                {/* FRONT FACE */}
                <div
                  onClick={() => handleSelect(service.id)}
                  className="absolute inset-0 [backface-visibility:hidden] bg-[#141416] border border-[rgba(34,197,94,0.25)] group-hover:border-[#22C55E] rounded-2xl p-6 cursor-pointer flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_24px_rgba(34,197,94,0.2)] overflow-hidden transition-all duration-200"
                >
                  <img
                    src={service.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20 group-hover:opacity-25 transition-opacity pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/85 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-3 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow mt-1">{service.tag}</span>
                      <div className="text-[#22C55E] p-2 bg-[#22C55E]/15 rounded-xl border border-[#22C55E]/30">
                        {service.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-heading font-bold text-[#F2F1EC] group-hover:text-[#22C55E] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#9A9A9E] leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-[rgba(34,197,94,0.2)] space-y-3">
                    <button
                      type="button"
                      onClick={(e) => toggleFlip(e, service.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#A8ABB3] hover:text-[#22C55E] transition-colors py-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{t('whyThisService')}</span>
                    </button>

                    <div className="flex items-center text-xs font-bold text-[#22C55E] group-hover:text-[#16A34A]">
                      {t('selectCategory')} <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>

                {/* BACK FACE (FLIPPED RATIONALE) */}
                <div
                  className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1C1C1F] border-2 border-[#22C55E] rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(34,197,94,0.25)] overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/15 px-2.5 py-1 rounded-md border border-[#22C55E]/30">
                        {t('serviceAreaRationale')}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleFlip(e, service.id)}
                        className="text-xs font-bold text-[#A8ABB3] hover:text-[#F2F1EC] bg-[#141416] px-2.5 py-1 rounded-lg border border-[rgba(34,197,94,0.25)] transition-colors cursor-pointer"
                      >
                        {t('backToCard')}
                      </button>
                    </div>

                    <h4 className="font-heading font-extrabold text-base text-[#22C55E]">
                      {service.rationaleTitle}
                    </h4>

                    <p className="text-xs text-[#F2F1EC] leading-relaxed">
                      {service.rationaleText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(service.id)}
                    className="w-full bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] font-heading font-bold py-3 rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-xs cursor-pointer mt-4"
                  >
                    <span>{t('proceedTo')} {service.title}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
