import React, { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "../../lib/hooks/useSiteSettings";
import { parseCounters } from "../../lib/settingsContent";

function useCountUp(
  target: number,
  duration: number = 2000,
  startCounting: boolean = false,
) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, startCounting]);
  return count;
}

function StatItem({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const count = useCountUp(value, 2000, isVisible);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-sm md:text-base font-medium text-muted uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export function StatsSection() {
  const { settings } = useSiteSettings();
  const parsed = parseCounters(settings.heroCounters);
  const stats = parsed.length
    ? parsed.map((item) => ({
        label: item.label,
        value: Number.parseInt(item.value.replace(/[^0-9]/g, ""), 10) || 0,
        suffix: item.value.replace(/[0-9\s]/g, ""),
      }))
    : [
        { label: "Years Experience", value: 5, suffix: "+" },
        { label: "Projects Completed", value: 46, suffix: "+" },
        { label: "Happy Clients", value: 29, suffix: "+" },
        { label: "Awards Won", value: 7, suffix: "" },
      ];

  return (
    <section className="py-5 border-y border-border bg-surface/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
