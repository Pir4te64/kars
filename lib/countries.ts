// Lista de países con sus banderas (emoji), códigos, prefijos telefónicos y formatos
export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string; // Formato de ejemplo: "xxx-xxx-xxxx"
}

const countries: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54", format: "xxx-xxx-xxxx" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58", format: "xxx-xx-xx" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1", format: "(xxx) xxx-xxxx" },
  { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52", format: "xxx-xxx-xxxx" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57", format: "xxx-xxx-xxxx" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56", format: "x xxxx xxxx" },
  { code: "PE", name: "Perú", flag: "🇵🇪", dialCode: "+51", format: "xxx-xxx-xxx" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593", format: "xx xxx xxxx" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598", format: "xxxx xxxx" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595", format: "xxx xxx-xxx" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591", format: "x xxx xxxx" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55", format: "(xx) xxxxx-xxxx" },
  { code: "ES", name: "España", flag: "🇪🇸", dialCode: "+34", format: "xxx xxx xxx" },
  { code: "IT", name: "Italia", flag: "🇮🇹", dialCode: "+39", format: "xxx xxx xxxx" },
  { code: "FR", name: "Francia", flag: "🇫🇷", dialCode: "+33", format: "x xx xx xx xx" },
  { code: "DE", name: "Alemania", flag: "🇩🇪", dialCode: "+49", format: "xxxx xxxxxxx" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dialCode: "+44", format: "xxxx xxxxxx" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", dialCode: "+1", format: "(xxx) xxx-xxxx" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61", format: "x xxxx xxxx" },
  { code: "NZ", name: "Nueva Zelanda", flag: "🇳🇿", dialCode: "+64", format: "xxx xxx xxxx" },
  { code: "JP", name: "Japón", flag: "🇯🇵", dialCode: "+81", format: "xx-xxxx-xxxx" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86", format: "xxx xxxx xxxx" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91", format: "xxxxx xxxxx" },
  { code: "RU", name: "Rusia", flag: "🇷🇺", dialCode: "+7", format: "xxx xxx-xx-xx" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷", dialCode: "+82", format: "xx-xxxx-xxxx" },
  { code: "SA", name: "Arabia Saudí", flag: "🇸🇦", dialCode: "+966", format: "xx xxx xxxx" },
  { code: "AE", name: "Emiratos Árabes", flag: "🇦🇪", dialCode: "+971", format: "xx xxx xxxx" },
  { code: "IL", name: "Israel", flag: "🇮🇱", dialCode: "+972", format: "xx-xxx-xxxx" },
  { code: "TR", name: "Turquía", flag: "🇹🇷", dialCode: "+90", format: "xxx xxx xxxx" },
  { code: "ZA", name: "Sudáfrica", flag: "🇿🇦", dialCode: "+27", format: "xx xxx xxxx" },
  { code: "EG", name: "Egipto", flag: "🇪🇬", dialCode: "+20", format: "xxx xxx xxxx" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234", format: "xxx xxx xxxx" },
  { code: "KE", name: "Kenia", flag: "🇰🇪", dialCode: "+254", format: "xxx xxxxxxx" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506", format: "xxxx xxxx" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", dialCode: "+507", format: "xxxx-xxxx" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502", format: "xxxx xxxx" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504", format: "xxxx-xxxx" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", dialCode: "+505", format: "xxxx xxxx" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503", format: "xxxx xxxx" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴", dialCode: "+1", format: "(xxx) xxx-xxxx" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dialCode: "+53", format: "x xxx xxxx" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", dialCode: "+1", format: "(xxx) xxx-xxxx" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", dialCode: "+1", format: "(xxx) xxx-xxxx" },
  { code: "HT", name: "Haití", flag: "🇭🇹", dialCode: "+509", format: "xxxx-xxxx" },
  { code: "TT", name: "Trinidad y Tobago", flag: "🇹🇹", dialCode: "+1", format: "(xxx) xxx-xxxx" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", dialCode: "+592", format: "xxx xxxx" },
  { code: "SR", name: "Surinam", flag: "🇸🇷", dialCode: "+597", format: "xxx-xxxx" },
  { code: "GF", name: "Guayana Francesa", flag: "🇬🇫", dialCode: "+594", format: "xxxx xx xx" },
  { code: "FK", name: "Islas Malvinas", flag: "🇫🇰", dialCode: "+500", format: "xxxxx" },
];

// Ordenar países alfabéticamente por nombre
countries.sort((a, b) => a.name.localeCompare(b.name));

export default countries;

