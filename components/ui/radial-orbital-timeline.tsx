"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Building2,
  BookOpen,
  Users,
  Handshake,
  LayoutGrid,
  ExternalLink,
  Link as LinkedinIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PoleData, Member } from "@/lib/types";

// Icon map per pole name
const POLE_ICONS: Record<string, React.ElementType> = {
  Bureau: LayoutGrid,
  "Finance de Marché": TrendingUp,
  "Finance d'Entreprise": Building2,
  Formation: BookOpen,
  Alumni: Users,
  Partenariat: Handshake,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberAvatar({ member }: { member: Member }) {
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div className="relative">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-semibold text-white/80">
            {getInitials(member.name)}
          </div>
        )}
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LinkedinIcon size={8} className="text-white" />
          </a>
        )}
      </div>
      <div className="text-center max-w-[60px]">
        <p className="text-[10px] font-medium text-white/90 leading-tight truncate">
          {member.name.split(" ")[0]}
        </p>
        <p className="text-[9px] text-white/50 leading-tight truncate">
          {member.role}
        </p>
      </div>
    </div>
  );
}

interface RadialOrbitalTimelineProps {
  poleData: PoleData[];
}

export default function RadialOrbitalTimeline({
  poleData,
}: RadialOrbitalTimelineProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [radius, setRadius] = useState<number>(380);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Compute radius from container width
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setRadius(Math.floor(Math.min(w * 0.16, 210)));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedId(null);
      setAutoRotate(true);
    }
  };

  const togglePole = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAutoRotate(true);
    } else {
      setExpandedId(id);
      setAutoRotate(false);
      // Rotate so the clicked node comes to the top
      const nodeIndex = id; // id = index
      const totalNodes = poleData.length;
      const targetAngle = (nodeIndex / totalNodes) * 360;
      setRotationAngle(270 - targetAngle);
    }
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, zIndex, opacity };
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-background overflow-visible"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Center orb */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-white/5 animate-pulse flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70" />
            <div
              className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
            <span className="text-xs font-bold tracking-widest text-white/80 z-10">
              CSF
            </span>
          </div>

          {/* Orbit ring */}
          <div
            className="absolute rounded-full border border-white/10"
            style={{ width: radius * 2, height: radius * 2 }}
          />

          {/* Pole nodes */}
          {poleData.map((pole, index) => {
            const position = calculateNodePosition(index, poleData.length);
            const isExpanded = expandedId === index;
            const Icon = POLE_ICONS[pole.pole] ?? LayoutGrid;

            return (
              <div
                key={pole.pole}
                ref={(el) => { nodeRefs.current[index] = el }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePole(index);
                }}
              >
                {/* Node circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300 transform
                    ${isExpanded
                      ? "bg-white text-black border-white shadow-lg shadow-white/30 scale-150"
                      : "bg-background text-white border-white/40 hover:border-white/70"
                    }
                  `}
                >
                  <Icon size={16} />
                </div>

                {/* Node label */}
                <div
                  className={`
                    absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                    text-xs font-semibold tracking-wider transition-all duration-300
                    ${isExpanded ? "text-white scale-125" : "text-white/70"}
                  `}
                >
                  {pole.badge}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-background/95 backdrop-blur-lg border-white/20 shadow-xl shadow-black/50 overflow-visible">
                    {/* Connector line */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/30" />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-white/30 text-white/70 uppercase tracking-widest px-2"
                        >
                          {pole.badge}
                        </Badge>
                        <span className="text-[10px] text-white/40">
                          {pole.members.length} membres
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold mt-1 text-white">
                        {pole.pole}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-[11px] text-white/60 leading-relaxed mb-4">
                        {pole.description}
                      </p>

                      {/* Members grid */}
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex flex-wrap gap-3 justify-start">
                          {pole.members.map((member, i) => (
                            <MemberAvatar key={`${member.name}-${i}`} member={member} />
                          ))}
                        </div>
                      </div>

                      {/* LinkedIn link if any member has one */}
                      {pole.members.some((m) => m.linkedin) && (
                        <p className="text-[9px] text-white/30 mt-3 flex items-center gap-1">
                          <ExternalLink size={8} />
                          Survolez un membre pour accéder à son LinkedIn
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
