import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "sm", showText = true }: LogoProps) {
  const sizes = {
    sm: { img: 24, text: "text-lg" },
    md: { img: 32, text: "text-xl" },
    lg: { img: 40, text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/pleeboo.svg"
        alt="Pleeboo"
        width={sizes[size].img}
        height={sizes[size].img}
        className="rounded-md"
      />
      {showText && (
        <span
          className={cn("font-['Nunito'] font-bold", sizes[size].text)}
          style={{ color: "#333463" }}
        >
          pleeboo
        </span>
      )}
    </div>
  );
}
