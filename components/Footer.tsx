import Logo from './Logo'

const socialLinks = [
  {
    name: 'Facebook',
    icon: (
      <img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" alt="Facebook" className="w-6 h-6" />
    ),
    href: 'https://www.facebook.com/share/16z8qHHhkt/',
  },
  {
    name: 'Twitter',
    icon: (
      <img src="https://img.icons8.com/ios-filled/50/000000/twitter.png" alt="Twitter" className="w-6 h-6" />
    ),
    href: '#',
  },
  {
    name: 'LinkedIn',
    icon: (
      <img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
    ),
    href: '#',
  },
  {
    name: 'Instagram',
    icon: (
      <img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" alt="Instagram" className="w-6 h-6" />
    ),
    href: 'https://www.instagram.com/kars.com.ar',
  },
]

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Section */}
          <div>
            <div className="mb-6">
              <Logo className="h-32" variant="white" />
            </div>
           
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Section - Contact */}
          <div className="md:ml-auto md:pl-12">
            <h4 className="text-xl font-semibold text-primary-600 mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div className="text-white">
                  <div>Malaver 3733, Florida Oeste</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span className="text-white">1121596100</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span className="text-white">Contacto@kars.ar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
