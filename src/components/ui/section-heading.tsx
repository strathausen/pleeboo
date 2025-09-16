import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "white";
}

export function SectionHeading({ children, className, variant = "default" }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "-underline-offset-1 mb-4 font-bold text-3xl underline decoration-[8px]",
        variant === "white"
          ? "decoration-yellow-400/70"
          : "decoration-yellow-200 dark:decoration-yellow-600",
        className,
      )}
      style={{ textDecorationSkipInk: "none" }}
    >
      {children}
    </h2>
  );
}
