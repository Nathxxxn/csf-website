'use client';

import React from 'react';

type GradientDotsProps = {
	dotSize?: number;
	spacing?: number;
	className?: string;
};

export function GradientDots({
	dotSize = 1.5,
	spacing = 20,
	className,
}: GradientDotsProps) {
	return (
		<div className={`absolute inset-0 overflow-hidden ${className ?? ''}`}>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.22) ${dotSize}px, transparent ${dotSize}px)`,
					backgroundSize: `${spacing}px ${spacing * 0.866}px`,
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.22) ${dotSize}px, transparent ${dotSize}px)`,
					backgroundSize: `${spacing}px ${spacing * 0.866}px`,
					backgroundPosition: `${spacing / 2}px ${(spacing * 0.866) / 2}px`,
				}}
			/>
			{/* Soft centered vignette to fade edges */}
			<div
				className="absolute inset-0"
				style={{
					background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(5,5,5,0.55) 100%)',
				}}
			/>
		</div>
	);
}
