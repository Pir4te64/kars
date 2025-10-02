import React from 'react'

const Logo = ({ className = "text-2xl", variant = "default" }) => {
  const logoSrc = variant === "white" ? "/logo_kars_blanco.png" : "/logo_kars_negro.png"
  
  return (
    <div className={className}>
      <img 
        src={logoSrc} 
        alt="KARS - Tu concesionario de confianza" 
        className="h-32 w-auto"
      />
    </div>
  )
}

export default Logo
