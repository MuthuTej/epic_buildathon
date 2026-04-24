import React from 'react';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`liq-card p-4 ${className}`}>
      <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
      <div className="mt-3 h-6 w-3/4 rounded bg-white/5 animate-pulse" />
      <div className="mt-2 h-3 w-1/2 rounded bg-white/5 animate-pulse" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
