import Image from 'next/image'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white'
}

export default function Logo({ className = 'text-2xl', variant = 'default' }: LogoProps) {
  const logoSrc = variant === 'white' ? '/logo_kars_blanco.png' : '/logo_kars_negro.png'

  return (
    <div className={className}>
      <Image
        src={logoSrc}
        alt="KARS - Tu concesionario de confianza"
        width={128}
        height={128}
        className="h-32 w-auto"
        priority
      />
    </div>
  )
}
