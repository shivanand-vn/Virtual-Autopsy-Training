import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { FeatureCard } from './FeatureCard';

export const LeftShowcasePanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="space-y-3">
        <StatusBadge>ACCREDITED CLINICAL TRAINING PORTAL</StatusBadge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
          Sign In to Virtual Autopsy Academy
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Access your accredited post-mortem CT (PMCT) case studies, 3D multi-planar reconstructions, and forensic training modules directly within the secure browser-based PACS viewer.
        </p>
      </div>

      {/* Official PMCT Suite Showcase Image */}
      <div className="pt-1">
        <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group">
          <img
            src="/showcase-ct.jpg"
            alt="Virtual Autopsy PMCT Imaging Suite"
            className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* 3 Feature Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <FeatureCard
          title="Interactive Cloud DICOM"
          description="Volumetric MPR, MIP, and 3D surface rendering."
        />
        <FeatureCard
          title="Accreditation Modules"
          description="CME / CPD certification with verified logs."
        />
        <FeatureCard
          title="Forensic Case Vault"
          description="Chain-of-custody compliant training database."
        />
      </div>
    </div>
  );
};
