import puppeteer from 'puppeteer'

export interface AdDesignSpec {
  template: 'dark-power' | 'bold-minimal' | 'editorial-split'
  dimensions: '1:1' | '4:5' | '9:16' | '16:9'
  headline: string
  subheadline?: string
  cta: string
  features?: { icon: string; title: string; desc?: string }[]
  accentColor?: string
  brandName?: string
  brandTagline?: string
  logoUrl?: string
  backgroundStyle?: 'dark' | 'light' | 'gradient-dark' | 'gradient-color'
  hook?: string
}

function getDimensions(ratio: string): { w: number; h: number } {
  switch (ratio) {
    case '9:16': return { w: 1080, h: 1920 }
    case '4:5':  return { w: 1080, h: 1350 }
    case '16:9': return { w: 1200, h: 628 }
    default:     return { w: 1080, h: 1080 } // 1:1
  }
}

// ── Template 1: DARK POWER ────────────────────────────────────────────────
function darkPowerTemplate(spec: AdDesignSpec, w: number, h: number): string {
  const accent = spec.accentColor ?? '#8b5cf6'
  const accentDark = accent + '33'
  const accentMid = accent + '55'
  const features = spec.features ?? []
  const headlineFontSize = w === 1200 ? 52 : h >= 1350 ? 78 : 68
  const subFontSize = w === 1200 ? 20 : 22
  const isWide = w > h

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Manrope:wght@700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${w}px; height:${h}px; overflow:hidden; }
body {
  width:${w}px; height:${h}px;
  background: #07001a;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}
.bg-glow-1 {
  position:absolute; border-radius:50%;
  width:${Math.round(w*0.7)}px; height:${Math.round(w*0.7)}px;
  background: radial-gradient(circle, ${accent}30 0%, transparent 65%);
  top: -${Math.round(w*0.2)}px; right: -${Math.round(w*0.15)}px;
  pointer-events:none;
}
.bg-glow-2 {
  position:absolute; border-radius:50%;
  width:${Math.round(w*0.5)}px; height:${Math.round(w*0.5)}px;
  background: radial-gradient(circle, #3b82f625 0%, transparent 65%);
  bottom: 0; left: -${Math.round(w*0.1)}px;
  pointer-events:none;
}
.noise-overlay {
  position:absolute; inset:0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events:none;
}
.grid-lines {
  position:absolute; inset:0;
  background-image: linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events:none;
}
.inner {
  position:relative; z-index:10;
  padding: ${isWide ? '50px 60px' : '60px 60px'};
  height:100%;
  display:flex; flex-direction:column;
  ${isWide ? 'flex-direction:row; align-items:center; gap:60px;' : ''}
}
${isWide ? `
.inner-left { flex:1; display:flex; flex-direction:column; justify-content:center; }
.inner-right { flex:0 0 ${Math.round(w*0.38)}px; display:flex; flex-direction:column; justify-content:center; gap:16px; }
` : ''}

/* Logo / Brand */
.brand { display:flex; flex-direction:column; margin-bottom:${isWide ? 0 : Math.round(h*0.055)}px; }
.brand-name {
  font-family:'Manrope',sans-serif;
  font-size:${w===1200?28:32}px; font-weight:900;
  background: linear-gradient(135deg, #ffffff, ${accent});
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  letter-spacing:-0.5px;
}
.brand-tagline {
  font-size:${w===1200?11:12}px; font-weight:600; color:#64748b;
  letter-spacing:0.18em; text-transform:uppercase; margin-top:4px;
}
.logo-img { height:${w===1200?40:52}px; object-fit:contain; object-position:left; margin-bottom:6px; }

/* Hook badge */
.hook-badge {
  display:inline-flex; align-items:center; gap:8px;
  background:${accentDark}; border:1px solid ${accentMid};
  border-radius:100px; padding:8px 18px;
  font-size:${w===1200?13:15}px; font-weight:600; color:${accent};
  width:fit-content;
  margin-bottom:${Math.round(h*0.025)}px;
}
.hook-dot { width:8px; height:8px; border-radius:50%; background:${accent}; animation:none; }

/* Headline */
.headline {
  font-family:'Manrope',sans-serif;
  font-size:${headlineFontSize}px; font-weight:900;
  line-height:1.05; letter-spacing:-1.5px;
  color:#ffffff;
  margin-bottom:${Math.round(h*0.025)}px;
  ${isWide ? '' : `max-width:${w*0.9}px;`}
}
.headline .accent-word { color:${accent}; font-style:italic; }
.headline .white-word { color:#ffffff; }

/* Subheadline */
.subheadline {
  font-size:${subFontSize}px; font-weight:400; color:#94a3b8; line-height:1.5;
  margin-bottom:${Math.round(h*0.04)}px;
  ${isWide ? '' : `max-width:${w*0.85}px;`}
}

/* Divider */
.divider {
  width:60px; height:3px; border-radius:2px;
  background:linear-gradient(90deg, ${accent}, transparent);
  margin-bottom:${Math.round(h*0.04)}px;
}

/* Features */
.features { display:flex; flex-direction:column; gap:${isWide?12:14}px; }
${!isWide ? '.features { margin-bottom: auto; }' : ''}
.feature-row {
  display:flex; align-items:center; gap:16px;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:16px; padding:${isWide?'16px 20px':'20px 22px'};
  backdrop-filter:blur(10px);
}
.feature-row:hover { border-color:${accent}40; }
.feat-icon {
  font-size:${isWide?26:30}px; flex-shrink:0;
  width:${isWide?44:52}px; height:${isWide?44:52}px;
  display:flex; align-items:center; justify-content:center;
  background:${accentDark}; border-radius:12px;
}
.feat-body { flex:1; }
.feat-title { font-size:${isWide?15:17}px; font-weight:700; color:#f1f5f9; }
.feat-desc { font-size:${isWide?12:13}px; color:#64748b; margin-top:3px; line-height:1.4; }

/* CTA Button */
.cta-wrap { margin-top:${isWide?0:Math.round(h*0.04)}px; }
.cta-btn {
  display:flex; align-items:center; justify-content:center; gap:12px;
  width:100%;
  background:linear-gradient(135deg, ${accent} 0%, #4f46e5 100%);
  border-radius:${w===1200?18:20}px;
  padding:${w===1200?'22px 40px':'28px 40px'};
  font-family:'Manrope',sans-serif;
  font-size:${w===1200?20:24}px; font-weight:800; color:#ffffff;
  letter-spacing:-0.3px;
  box-shadow: 0 20px 60px ${accent}40;
  position:relative; overflow:hidden;
}
.cta-btn::before {
  content:'';
  position:absolute; inset:0;
  background:linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
  border-radius:inherit;
}
.cta-arrow { font-size:${w===1200?20:24}px; }

/* Metric badge (optional) */
.metric-badge {
  display:inline-flex; align-items:center; gap:10px;
  background: linear-gradient(135deg, ${accent}20, #1e1b4b80);
  border:1px solid ${accent}40;
  border-radius:20px; padding:16px 24px;
  margin-bottom:16px;
}
.metric-number { font-family:'Manrope',sans-serif; font-size:52px; font-weight:900; color:${accent}; line-height:1; }
.metric-label { font-size:14px; color:#94a3b8; line-height:1.4; max-width:120px; }

</style>
</head>
<body>
<div class="bg-glow-1"></div>
<div class="bg-glow-2"></div>
<div class="noise-overlay"></div>
<div class="grid-lines"></div>
<div class="inner">
  ${isWide ? '<div class="inner-left">' : ''}
  <!-- Brand -->
  <div class="brand">
    ${spec.logoUrl ? `<img class="logo-img" src="${spec.logoUrl}" />` : ''}
    ${!spec.logoUrl && spec.brandName ? `<div class="brand-name">${spec.brandName}</div>` : ''}
    ${spec.brandTagline ? `<div class="brand-tagline">${spec.brandTagline}</div>` : ''}
  </div>

  ${spec.hook ? `<div class="hook-badge"><div class="hook-dot"></div>${spec.hook}</div>` : ''}

  <!-- Headline -->
  <div class="headline">${formatHeadline(spec.headline, accent)}</div>
  ${spec.subheadline ? `<div class="divider"></div><div class="subheadline">${spec.subheadline}</div>` : ''}

  ${!isWide && features.length > 0 ? `
  <div class="features" style="margin-top:auto; margin-bottom:${Math.round(h*0.03)}px;">
    ${features.slice(0, 3).map(f => `
    <div class="feature-row">
      <div class="feat-icon">${f.icon}</div>
      <div class="feat-body">
        <div class="feat-title">${f.title}</div>
        ${f.desc ? `<div class="feat-desc">${f.desc}</div>` : ''}
      </div>
    </div>`).join('')}
  </div>` : ''}

  <!-- CTA -->
  <div class="cta-wrap">
    <div class="cta-btn">
      ${spec.cta}
      <span class="cta-arrow">→</span>
    </div>
  </div>
  ${isWide ? '</div>' : ''}

  ${isWide && features.length > 0 ? `
  <div class="inner-right">
    <div class="features">
      ${features.slice(0, 4).map(f => `
      <div class="feature-row">
        <div class="feat-icon">${f.icon}</div>
        <div class="feat-body">
          <div class="feat-title">${f.title}</div>
          ${f.desc ? `<div class="feat-desc">${f.desc}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>` : ''}
</div>
</body></html>`
}

// ── Template 2: BOLD MINIMAL ──────────────────────────────────────────────
function boldMinimalTemplate(spec: AdDesignSpec, w: number, h: number): string {
  const accent = spec.accentColor ?? '#8b5cf6'
  const hFontSize = w === 1200 ? 58 : h >= 1920 ? 100 : h >= 1350 ? 88 : 80

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${w}px; height:${h}px; overflow:hidden; }
body {
  width:${w}px; height:${h}px;
  background: linear-gradient(160deg, #020817 0%, #0f0a2a 40%, #1a0f3a 100%);
  font-family:'Manrope',sans-serif; color:#fff;
  position:relative; overflow:hidden;
}
.stripe {
  position:absolute; left:0; top:0; bottom:0; width:8px;
  background: linear-gradient(to bottom, transparent, ${accent}, transparent);
}
.circle-deco {
  position:absolute; right:-${Math.round(w*0.15)}px; top:50%;
  transform:translateY(-50%);
  width:${Math.round(w*0.6)}px; height:${Math.round(w*0.6)}px;
  border-radius:50%;
  border:1px solid ${accent}15;
}
.circle-deco-2 {
  position:absolute; right:-${Math.round(w*0.08)}px; top:50%;
  transform:translateY(-50%);
  width:${Math.round(w*0.4)}px; height:${Math.round(w*0.4)}px;
  border-radius:50%;
  border:1px solid ${accent}25;
}
.inner {
  position:relative; z-index:10; padding:${Math.round(h*0.07)}px ${Math.round(w*0.07)}px;
  height:100%; display:flex; flex-direction:column; justify-content:space-between;
}
.brand-row { display:flex; align-items:center; gap:12px; }
.brand-name { font-size:${w===1200?22:26}px; font-weight:900; color:#fff; }
.brand-pill {
  padding:6px 14px; border-radius:100px;
  border:1px solid ${accent}50; color:${accent};
  font-size:${w===1200?11:13}px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;
}
.main-content { flex:1; display:flex; flex-direction:column; justify-content:center; }
.number { font-size:${Math.round(hFontSize*0.7)}px; font-weight:900; color:${accent}; opacity:0.15; line-height:1; }
.big-headline {
  font-size:${hFontSize}px; font-weight:900; line-height:1.0; letter-spacing:-2px;
  color:#fff; margin-bottom:${Math.round(h*0.03)}px;
}
.big-headline .accent { color:${accent}; display:block; font-style:italic; }
.bar { width:${Math.round(w*0.15)}px; height:5px; background:${accent}; border-radius:3px; margin-bottom:${Math.round(h*0.025)}px; }
.sub { font-size:${w===1200?18:22}px; font-weight:400; color:#94a3b8; line-height:1.5; max-width:${Math.round(w*0.65)}px; }
.bottom { display:flex; flex-direction:column; gap:20px; }
.cta {
  background:${accent}; border-radius:18px;
  padding:${w===1200?'20px 40px':'26px 48px'};
  font-size:${w===1200?20:24}px; font-weight:800; color:#fff;
  width:fit-content; letter-spacing:-0.3px;
}
.social-proof { font-size:${w===1200?14:16}px; color:#475569; }
.social-proof span { color:#94a3b8; font-weight:600; }
</style>
</head>
<body>
<div class="stripe"></div>
<div class="circle-deco"></div>
<div class="circle-deco-2"></div>
<div class="inner">
  <div class="brand-row">
    ${spec.logoUrl ? `<img style="height:${w===1200?40:50}px;object-fit:contain;" src="${spec.logoUrl}" />` : ''}
    ${!spec.logoUrl && spec.brandName ? `<div class="brand-name">${spec.brandName}</div>` : ''}
    ${spec.hook ? `<div class="brand-pill">${spec.hook}</div>` : ''}
  </div>
  <div class="main-content">
    <div class="big-headline">${formatHeadlineSplit(spec.headline, accent)}</div>
    <div class="bar"></div>
    ${spec.subheadline ? `<div class="sub">${spec.subheadline}</div>` : ''}
  </div>
  <div class="bottom">
    <div class="cta">${spec.cta} →</div>
    ${spec.brandTagline ? `<div class="social-proof">— <span>${spec.brandTagline}</span></div>` : ''}
  </div>
</div>
</body></html>`
}

// ── Template 3: EDITORIAL SPLIT ────────────────────────────────────────────
function editorialSplitTemplate(spec: AdDesignSpec, w: number, h: number): string {
  const accent = spec.accentColor ?? '#8b5cf6'
  const features = spec.features ?? []
  const isVertical = h > w

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Manrope:wght@700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${w}px; height:${h}px; overflow:hidden; }
body {
  width:${w}px; height:${h}px;
  background:#ffffff; font-family:'Inter',sans-serif; position:relative; overflow:hidden;
}
.left-panel {
  position:absolute; left:0; top:0; bottom:0; width:${isVertical ? '100%' : '50%'};
  background:linear-gradient(160deg, #1e1b4b 0%, #0f0a1a 100%);
  display:flex; flex-direction:column; justify-content:space-between;
  padding:${Math.round(Math.min(w,h)*0.06)}px;
}
.right-panel {
  position:absolute; right:0; top:0; bottom:0; width:50%;
  background:#f8fafc;
  display:flex; flex-direction:column; justify-content:center;
  padding:${Math.round(w*0.04)}px;
  ${isVertical ? 'display:none;' : ''}
}
.brand-name { font-family:'Manrope',sans-serif; font-size:${Math.round(w*0.025)}px; font-weight:900; color:${accent}; }
.headline {
  font-family:'Manrope',sans-serif;
  font-size:${isVertical ? Math.round(w*0.065) : Math.round(w*0.05)}px;
  font-weight:900; color:#fff; line-height:1.1; letter-spacing:-1px;
}
.headline em { color:${accent}; font-style:normal; }
.accent-bar { width:50px; height:4px; background:${accent}; border-radius:2px; margin:20px 0; }
.sub { font-size:${Math.round(w*0.018)}px; color:#94a3b8; line-height:1.6; }
.cta-box {
  background:${accent}; border-radius:16px;
  padding:${isVertical ? '24px 32px' : '20px 28px'};
  font-family:'Manrope',sans-serif;
  font-size:${isVertical ? Math.round(w*0.022) : Math.round(w*0.018)}px;
  font-weight:800; color:#fff; width:100%; text-align:center;
}
.features-right { display:flex; flex-direction:column; gap:${Math.round(w*0.02)}px; }
.feat { display:flex; align-items:center; gap:16px; padding:${Math.round(w*0.018)}px; background:#f1f5f9; border-radius:14px; }
.feat-icon { font-size:${Math.round(w*0.025)}px; }
.feat-title { font-size:${Math.round(w*0.016)}px; font-weight:700; color:#1e293b; }
.feat-desc { font-size:${Math.round(w*0.013)}px; color:#64748b; margin-top:2px; }
.section-label { font-size:${Math.round(w*0.012)}px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; color:#64748b; margin-bottom:${Math.round(w*0.02)}px; }
</style>
</head>
<body>
<div class="left-panel">
  <div>
    ${spec.logoUrl ? `<img style="height:${Math.round(w*0.04)}px;object-fit:contain;object-position:left;margin-bottom:16px;" src="${spec.logoUrl}">` : ''}
    ${!spec.logoUrl && spec.brandName ? `<div class="brand-name">${spec.brandName}</div>` : ''}
  </div>
  <div>
    <div class="headline">${spec.headline.replace(/\?/g, '<em>?</em>').replace(/:/g, '<em>:</em>')}</div>
    <div class="accent-bar"></div>
    ${spec.subheadline ? `<div class="sub">${spec.subheadline}</div>` : ''}
  </div>
  <div>
    <div class="cta-box">${spec.cta} →</div>
  </div>
</div>
${!isVertical ? `
<div class="right-panel">
  <div class="section-label">Por qué funciona</div>
  <div class="features-right">
    ${features.slice(0, 4).map(f => `
    <div class="feat">
      <div class="feat-icon">${f.icon}</div>
      <div>
        <div class="feat-title">${f.title}</div>
        ${f.desc ? `<div class="feat-desc">${f.desc}</div>` : ''}
      </div>
    </div>`).join('')}
  </div>
</div>` : ''}
</body></html>`
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatHeadline(text: string, accent: string): string {
  // Wrap question marks and exclamation marks with accent color
  return text
    .replace(/¿([^?]+)\?/g, `<span class="accent-word">¿$1?</span>`)
    .replace(/([A-ZÁÉÍÓÚÑ]{4,})/g, `<span class="white-word">$1</span>`)
}

function formatHeadlineSplit(text: string, accent: string): string {
  const words = text.split(' ')
  const mid = Math.ceil(words.length / 2)
  const line1 = words.slice(0, mid).join(' ')
  const line2 = words.slice(mid).join(' ')
  return `${line1}<span class="accent"> ${line2}</span>`
}

// ── Main renderer ─────────────────────────────────────────────────────────

let browserInstance: ReturnType<typeof puppeteer.launch> extends Promise<infer B> ? B : never

async function getBrowser() {
  if (!browserInstance) {
    const pup = await import('puppeteer')
    browserInstance = await pup.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    })
  }
  return browserInstance
}

export async function renderAdDesign(spec: AdDesignSpec): Promise<Buffer> {
  const { w, h } = getDimensions(spec.dimensions)

  let html: string
  switch (spec.template) {
    case 'bold-minimal':       html = boldMinimalTemplate(spec, w, h); break
    case 'editorial-split':    html = editorialSplitTemplate(spec, w, h); break
    case 'dark-power':
    default:                   html = darkPowerTemplate(spec, w, h); break
  }

  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    // Give Google Fonts 1.5s to load
    await new Promise(r => setTimeout(r, 1500))
    const buffer = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: h } })
    return Buffer.from(buffer)
  } finally {
    await page.close()
  }
}
