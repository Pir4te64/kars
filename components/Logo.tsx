import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
}

export default function Logo({
  className = "",
  variant = "default",
}: LogoProps) {
  const logoSrc =
    variant === "white" ? "/logo_kars_blanco.png" : "/logo_kars_negro.png";

  return (
    <Link href="/" className={`cursor-pointer ${className}`}>
      <Image
        src={logoSrc}
        alt="KARS - Tu concesionario de confianza"
        width={140}
        height={140}
        className="h-16 sm:h-16 md:h-28 lg:h-32 w-auto"
        priority
      />
    </Link>
  );
}
