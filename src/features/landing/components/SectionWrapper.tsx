import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  id: string;
  dividerColor?: 'indigo' | 'purple' | 'blue' | 'emerald';
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, id, dividerColor = 'indigo' }) => {
  const colorClass = `via-${dividerColor}-500/30`;

  return (
    <div className="relative">
      <section id={id} className="relative scroll-auto">
        <div className={`absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent ${colorClass} to-transparent`}></div>
        {children}
      </section>
    </div>
  );
};

export default SectionWrapper;
