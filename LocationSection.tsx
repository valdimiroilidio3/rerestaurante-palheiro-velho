import { useState } from "react";
import { ExternalLink, Navigation, Phone } from "lucide-react";
import { BRAND, CONCEPT_NOTICE, CONTACT, MAPS_DIRECTIONS, MAPS_EMBED, SOURCES } from "../data/site";
import { useReveals } from "../lib/anim";
import { Btn, Eyebrow, IgIcon, MaskWords } from "./primitives";

function StylisedMap() {
  return (
    <svg viewBox="0 0 400 520" className="h-full w-full" role="img" aria-label="Esquema ilustrativo: oceano, duna e localização em Esmoriz">
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#12333c" /><stop offset="100%" stopColor="#0d2229" /></linearGradient>
        <linearGradient id="sandg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8dcc8" /><stop offset="100%" stopColor="#d5c3a3" /></linearGradient>
      </defs>
      <rect width="400" height="520" fill="#f0e8d8" /><rect x="240" y="0" width="160" height="520" fill="#e6dcc7" />
      <path d="M0 0 H150 C120 130 175 250 140 380 C120 450 150 490 160 520 H0 Z" fill="url(#sea)" />
      <g stroke="#9fbcbd" strokeOpacity="0.42" fill="none" strokeWidth="1.4" className="animate-drift origin-center">
        <path d="M8 80 C40 68 70 92 96 78" /><path d="M6 130 C42 118 74 142 104 126" /><path d="M10 186 C44 174 78 198 108 182" /><path d="M6 244 C38 232 70 256 100 240" /><path d="M12 302 C46 290 78 314 106 298" /><path d="M8 360 C40 348 72 372 100 356" /><path d="M14 420 C46 408 76 432 104 416" />
      </g>
      <path d="M150 0 C120 130 175 250 140 380 C120 450 150 490 160 520 L214 520 C196 470 186 430 200 360 C226 240 190 120 208 0 Z" fill="url(#sandg)" />
      <g fill="#3a2a20" fillOpacity="0.5">{Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${216 + (i % 3) * 7} ${30 + i * 40} l5 10 h-10 z`} />)}</g>
      <g stroke="#3a2a20" strokeOpacity="0.5" fill="none"><path d="M290 0 V520" strokeWidth="6" strokeOpacity="0.16" /><path d="M290 0 V520" strokeWidth="1.4" strokeDasharray="10 8" /><path d="M240 110 H400 M240 240 H400 M240 370 H400" strokeWidth="1.2" strokeOpacity="0.35" /><path d="M340 0 V520" strokeWidth="1.2" strokeOpacity="0.25" /></g>
      <g fill="#3a2a20" fillOpacity="0.1">{[[304, 24, 78, 62], [304, 134, 60, 84], [376, 134, 18, 84], [304, 264, 90, 84], [304, 392, 54, 96], [372, 392, 22, 60], [252, 392, 34, 46]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}</g>
      <g transform="translate(232 232)"><circle r="34" fill="#d1854a" fillOpacity="0.16" className="animate-pulse-ring" /><circle r="20" fill="#d1854a" fillOpacity="0.22" /><circle r="6.5" fill="#b4552a" /><path d="M0 -44 V-14" stroke="#b4552a" strokeWidth="1.4" /><text x="12" y="-32" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="1.6" fill="#3a2a20">PALHEIRO VELHO</text></g>
      <text x="26" y="46" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="3" fill="#9fbcbd">OCEANO</text><text x="26" y="60" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="3" fill="#9fbcbd">ATLÂNTICO</text><text x="330" y="500" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2.4" fill="#3a2a20" fillOpacity="0.55">ESMORIZ</text><text x="252" y="104" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#3a2a20" fillOpacity="0.45">MAPA</text>
    </svg>
  );
}

export function LocationSection({ onReserve }: { onReserve: (s?: string) => void }) {
  const [live, setLive] = useState(false);
  useReveals([]);
  const sources: [string, string][] = [["Instagram", SOURCES.instagram], ["Facebook", SOURCES.facebook], ["Google Maps", SOURCES.googleMaps], ["Site público", SOURCES.publicSite], ["CM Ovar", SOURCES.municipal], ["Junta de Freguesia", SOURCES.parish], ["Registo público", SOURCES.directory]];

  return (
    <section id="contacto" className="relative overflow-hidden bg-sand py-20 text-char sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 grain-layer mix-blend-multiply" />
      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            <Eyebrow index="08">Contacto & localização</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.3rem,8vw,5.2rem)] leading-[0.9]"><MaskWords text="Estamos em" /><br /><span className="italic text-espresso/70"><MaskWords text="Esmoriz." /></span></h2>
            <div className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              <div><p className="label text-espresso/50">Morada publicada</p><p className="mt-3 font-display text-[1.45rem] leading-snug">{CONTACT.name}</p><p className="mt-1 text-[0.98rem] leading-relaxed text-char/70">{CONTACT.address}<br />{CONTACT.locality}<br />{CONTACT.region}</p></div>
              <div><p className="label text-espresso/50">Canais publicados</p><a href={`tel:${CONTACT.phone}`} className="mt-3 block font-mono text-[1.15rem] tracking-[0.04em] transition-colors hover:text-ember" data-cursor="ligar">{CONTACT.phoneLabel}</a><a href={`mailto:${CONTACT.email}`} className="mt-3 block text-[0.95rem] text-char/70 transition-colors hover:text-ember">{CONTACT.email}</a></div>
              <div className="border-y border-espresso/20 py-5 sm:col-span-2"><p className="label text-espresso/50">Horário</p><p className="mt-3 max-w-[58ch] text-[0.98rem] leading-relaxed text-char/75">Não publicamos um horário neste conceito: as fontes públicas consultadas apresentam horários diferentes. Confirme sempre por telefone ou nos perfis oficiais antes da visita.</p></div>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Btn href={`tel:${CONTACT.phone}`} tone="dark" icon={<Phone size={14} strokeWidth={1.7} />}><span className="label">Ligar</span></Btn>
              <Btn href={MAPS_DIRECTIONS} tone="dark" variant="outline" icon={<Navigation size={14} strokeWidth={1.7} />}><span className="label">Como chegar</span></Btn>
              <Btn href={CONTACT.instagramUrl} tone="dark" variant="outline" icon={<IgIcon size={14} />}><span className="label">Instagram</span></Btn>
              <Btn onClick={() => onReserve("Contacto direto")} tone="dark" variant="quiet"><span className="label">Enviar email</span></Btn>
            </div>
            <div className="mt-10 border-t border-espresso/20 pt-6"><p className="label text-espresso/50">Fontes consultadas</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{sources.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="label flex items-center gap-1.5 text-espresso/65 hover:text-ember">{label} <ExternalLink size={11} /></a>)}</div><p className="mt-5 max-w-[68ch] text-[0.78rem] leading-relaxed text-char/50">{CONCEPT_NOTICE}</p></div>
          </div>
          <div className="relative">
            <div data-reveal="img" className="relative overflow-hidden border border-espresso/20 bg-cream shadow-[0_30px_80px_-40px_rgba(58,42,32,0.55)]" style={{ aspectRatio: "4 / 5" }}>
              {live ? <iframe title="Mapa do Palheiro Velho" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full grayscale-[35%]" /> : <StylisedMap />}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-espresso/10" /><button onClick={() => setLive((v) => !v)} className="label absolute top-4 right-4 border border-espresso/25 bg-cream/90 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-char hover:text-cream" data-cursor={live ? "esquema" : "mapa real"}>{live ? "mapa ilustrativo" : "mapa interativo"}</button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="label text-espresso/55">Esquema ilustrativo · localização via Google Maps</p><a href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="label link-swipe text-espresso/75 transition-colors hover:text-ember">abrir no Google Maps →</a></div>
            <a href={BRAND.publicLogoSource} target="_blank" rel="noreferrer" className="mt-6 flex items-center gap-4 border-t border-espresso/15 pt-5"><img src={BRAND.publicLogo} alt="Logótipo público do Palheiro Velho" loading="lazy" decoding="async" className="h-10 w-24 object-contain" /><span className="label text-espresso/50">{BRAND.assetStatus}<br />fonte: Junta de Freguesia de Esmoriz</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}