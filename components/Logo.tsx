import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white'
}

export default function Logo({ className = '', variant = 'default' }: LogoProps) {
  const logoSrc = variant === 'white' ? '/logo_kars_blanco.png' : '/logo_kars_negro.png'

  return (
    <Link href="/" className={`cursor-pointer ${className}`}>
      <Image
        src={logoSrc}
        alt="KARS - Tu concesionario de confianza"
        width={128}
        height={128}
        className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
        priority
      />
    </Link>
  )
}
