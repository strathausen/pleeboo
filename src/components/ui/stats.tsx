import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string | number;
  className?: string;
}

interface StatsProps {
  stats: Stat[];
  className?: string;
}

export function Stats({ stats, className }: StatsProps) {
  return (
    <div className={cn("flex gap-6 text-sm", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className={cn("text-gray-500", stat.className)}>
            {stat.label}
          </span>
          <span className={cn("font-semibold", stat.className)}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}