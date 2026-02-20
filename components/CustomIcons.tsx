
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// Helper for Image Icons
export const ImageIcon: React.FC<{ src: string, size?: number, className?: string }> = ({ src, size = 24, className = "" }) => (
  <img 
    src={src} 
    alt="Icon" 
    style={{ width: size, height: size }} 
    className={`object-contain ${className}`} 
  />
);

export const EventsIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <ImageIcon src="https://i.ibb.co/CpbWC810/12-removebg-preview.png" size={size} className={className} />
);

// --- Existing SVGs ---

export const MosqueIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 21H20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V11C5 10.2044 5.31607 9.44129 5.87868 8.87868C6.44129 8.31607 7.20435 8 8 8H16C16.7956 8 17.5587 8.31607 18.1213 8.87868C18.6839 9.44129 19 10.2044 19 11V21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3C10.5 4.5 13.5 4.5 12 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14C10 14 11 13 12 13C13 13 14 14 14 14V21H10V14Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="5" r="0.5" fill="currentColor"/>
  </svg>
);

export const QuranIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H12V5H5.2C4.53726 5 4 5.53726 4 6.2V19.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M20 19.5C20 18.837 19.4627 18.3 18.8 18.3H12V5H18.8C19.4627 5 20 5.53726 20 6.2V19.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M12 5V18.3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const SubhaIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="17" cy="9.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="19.5" cy="14" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="17" cy="18.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="7" cy="18.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="4.5" cy="14" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="7" cy="9.5" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M12 6V3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const KaabaIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 9L12 4L20 9V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V9Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 9L12 13L20 9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 13V20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10.5V18.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14H8.01" stroke="currentColor" strokeWidth={strokeWidth*2} strokeLinecap="round"/>
    <path d="M12 14H12.01" stroke="currentColor" strokeWidth={strokeWidth*2} strokeLinecap="round"/>
    <path d="M16 14H16.01" stroke="currentColor" strokeWidth={strokeWidth*2} strokeLinecap="round"/>
    <path d="M8 18H8.01" stroke="currentColor" strokeWidth={strokeWidth*2} strokeLinecap="round"/>
    <path d="M12 18H12.01" stroke="currentColor" strokeWidth={strokeWidth*2} strokeLinecap="round"/>
    <path d="M16 18H16.01" stroke="currentColor" strokeWidth={strokeWidth*2} strokeLinecap="round"/>
  </svg>
);

export const CompassIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AyahEndSymbol: React.FC<{ number: number, className?: string }> = ({ number, className = "" }) => {
  const arabicNumber = number.toLocaleString('ar-SA');
  return (
    <span className={`font-mushaf text-brand-gold text-xl inline-block mx-1 ${className}`}>
      ۝{arabicNumber}
    </span>
  );
};
