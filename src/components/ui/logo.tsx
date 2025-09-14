import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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
    <Link href="/" className="inline-block">
      <div className={cn("flex items-center gap-2", className)}>
        <Image
          src="/pleeboo.svg"
          alt="Pleeboo"
          width={sizes[size].img}
          height={sizes[size].img}
          className="rounded-md dark:brightness-0 dark:invert"
        />
        {showText && (
          <span
            className={cn(
              "font-['Nunito'] font-bold text-[#333463] dark:text-white",
              sizes[size].text
            )}
          >
            pleeboo
          </span>
        )}
      </div>
    </Link>
  );
}
