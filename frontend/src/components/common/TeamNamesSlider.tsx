import React, { useState, useEffect } from 'react';

export interface TeamMember {
  name: string;
  portfolioUrl: string;
}

export interface TeamPair {
  id: number;
  member1: TeamMember;
  member2: TeamMember;
}

/**
 * Team Members Portfolio Configuration
 * Update individual portfolio URLs here as they become available.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Nandeesh MN',
    portfolioUrl: 'https://nandeeshmn.vercel.app/',
  },
  {
    name: 'Shivanand VN',
    portfolioUrl: 'https://shivanandvn.vercel.app/',
  },
  {
    name: 'Iranna K',
    portfolioUrl: 'https://my-portfolio-lac-mu-62.vercel.app/',
  },
  {
    name: 'Ziyakausar',
    portfolioUrl: 'https://ziyakausar07.github.io/ziyakausar-portfolio/',
  },
  {
    name: 'MD Rizwan',
    portfolioUrl: 'https://rizwan-kotwal.vercel.app/',
  },
  {
    name: 'Vikram G',
    portfolioUrl: 'https://vikramgudihalportfolio.vercel.app',
  },
];

export const TEAM_PAIRS: TeamPair[] = [
  { id: 0, member1: TEAM_MEMBERS[0], member2: TEAM_MEMBERS[1] },
  { id: 1, member1: TEAM_MEMBERS[2], member2: TEAM_MEMBERS[3] },
  { id: 2, member1: TEAM_MEMBERS[4], member2: TEAM_MEMBERS[5] },
];

export const TeamNamesSlider: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    // If url is a placeholder, prevent broken navigation
    if (!url || url.startsWith('PORTFOLIO_URL_')) {
      e.preventDefault();
    }
  };

  const renderMemberLink = (member: TeamMember) => {
    const isPlaceholder = !member.portfolioUrl || member.portfolioUrl.startsWith('PORTFOLIO_URL_');
    return (
      <a
        href={isPlaceholder ? '#' : member.portfolioUrl}
        target={isPlaceholder ? undefined : '_blank'}
        rel={isPlaceholder ? undefined : 'noopener noreferrer'}
        onClick={(e) => handleLinkClick(e, member.portfolioUrl)}
        className="text-slate-700 hover:text-amber-700 hover:underline underline-offset-2 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded px-0.5 cursor-pointer font-bold inline-block"
        title={isPlaceholder ? `${member.name}` : `View ${member.name}'s Portfolio`}
        aria-label={isPlaceholder ? `${member.name}` : `View ${member.name}'s Portfolio`}
      >
        {member.name}
      </a>
    );
  };

  return (
    <div className="team-slider-container flex flex-col items-center justify-center text-center group/slider">
      {/* Stationary Heading */}
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 select-none whitespace-nowrap">
        Designed &amp; Developed By
      </span>

      {/* Sliding Names Viewport Container */}
      <div
        className="relative w-38 min-[380px]:w-44 sm:w-52 md:w-60 max-w-full h-5 overflow-hidden"
        aria-label="Development team members"
      >
        {reducedMotion ? (
          // Accessible stationary fallback when reduced motion is requested
          <div className="w-full h-full flex items-center justify-center text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold text-slate-700">
            {renderMemberLink(TEAM_PAIRS[0].member1)}
            <span className="text-amber-500 font-extrabold mx-1.5 select-none" aria-hidden="true">
              ·
            </span>
            {renderMemberLink(TEAM_PAIRS[0].member2)}
          </div>
        ) : (
          // Continuous seamless right-to-left slide animation
          <>
            <style>{`
              @keyframes teamPairSlide {
                0% {
                  transform: translateX(0%);
                  opacity: 1;
                  pointer-events: auto;
                }
                28.15% {
                  transform: translateX(0%);
                  opacity: 1;
                  pointer-events: auto;
                }
                33.33% {
                  transform: translateX(-105%);
                  opacity: 0;
                  pointer-events: none;
                }
                33.34% {
                  transform: translateX(105%);
                  opacity: 0;
                  pointer-events: none;
                }
                94.81% {
                  transform: translateX(105%);
                  opacity: 0;
                  pointer-events: none;
                }
                100% {
                  transform: translateX(0%);
                  opacity: 1;
                  pointer-events: auto;
                }
              }

              .team-pair-anim-0 {
                animation: teamPairSlide 13.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                animation-delay: 0s;
              }

              .team-pair-anim-1 {
                animation: teamPairSlide 13.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                animation-delay: -9.0s;
              }

              .team-pair-anim-2 {
                animation: teamPairSlide 13.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                animation-delay: -4.5s;
              }

              /* Pause sliding smoothly on hover so user can easily read and click links */
              .team-slider-container:hover .team-pair-anim-0,
              .team-slider-container:hover .team-pair-anim-1,
              .team-slider-container:hover .team-pair-anim-2 {
                animation-play-state: paused;
              }
            `}</style>

            {TEAM_PAIRS.map((pair, idx) => (
              <div
                key={pair.id}
                className={`absolute inset-0 w-full h-full flex items-center justify-center text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold text-slate-700 whitespace-nowrap will-change-transform team-pair-anim-${idx}`}
              >
                {renderMemberLink(pair.member1)}
                <span className="text-amber-500 font-extrabold mx-1.5 select-none" aria-hidden="true">
                  ·
                </span>
                {renderMemberLink(pair.member2)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
