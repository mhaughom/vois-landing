import React from 'react';

export type Section = 'hero' | 'problem' | 'solution' | 'demo' | 'adapt' | 'privacy' | 'cta';

export interface PhoneScreenProps {
  activeSection: Section;
}

export interface ScrollSectionProps {
  id: Section;
  children: React.ReactNode;
  onInView: (id: Section) => void;
  className?: string;
}