"""Snap near-duplicate hard-coded CSS colours to design tokens.

Every 3/6-digit hex colour in dist/*.css (except design-system.css, which defines the tokens) whose
CIEDE2000 distance to the nearest token is below THRESHOLD is replaced with var(--token).
Colours further away (illustration-specific tints) are left alone and reported.
Usage: python3 scripts/consolidate-colours.py [--write] [--threshold N]
"""
import glob, math, re, sys, collections

TOKENS = {
    # surfaces
    'ds-paper': '#fffdf7', 'ds-surface': '#ffffff', 'ds-cream': '#f7f1e3', 'ds-butter': '#fbf3dd',
    'ds-sage': '#eef3e8', 'ds-sage-strong': '#dfe9d6', 'ds-mist': '#e7eff7', 'ds-lilac': '#ece9f4',
    'ds-blush': '#f8ebe5', 'ds-warm-soft': '#fbefe6',
    # lines
    'ds-line': '#dde4d6', 'ds-line-strong': '#c6d2c0',
    # text
    'ds-ink': '#1f3a31', 'ds-ink-2': '#304c40', 'ds-ink-soft': '#4e6359', 'ds-ink-faint': '#71837a',
    # brand / states
    'ds-accent': '#244f91', 'ds-accent-hover': '#1b3f76', 'ds-accent-soft': '#e7eef8',
    'ds-success': '#2f6b4f', 'ds-success-mid': '#5f8d6c', 'ds-success-soft': '#e3f0e6',
    'ds-sage-mid': '#8ea596', 'ds-teal': '#19635a', 'ds-teal-mid': '#608d86',
    'ds-warm': '#a4532d', 'ds-warm-mid': '#c97c55', 'ds-brown': '#805037',
    'ds-gold': '#e2bf63', 'ds-gold-soft': '#f6e3a6', 'ds-sand': '#f2e8ce', 'ds-sky-mid': '#4b718f',
}

def to_lab(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92 for c in rgb]
    x = (lin[0] * 0.4124 + lin[1] * 0.3576 + lin[2] * 0.1805) / 0.95047
    y = lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722
    z = (lin[0] * 0.0193 + lin[1] * 0.1192 + lin[2] * 0.9505) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)

def de2000(a, b):
    L1, a1, b1 = a; L2, a2, b2 = b
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360; h2p = math.degrees(math.atan2(b2, a2p)) % 360
    dLp, dCp = L2 - L1, C2p - C1p
    dh = h2p - h1p
    if C1p * C2p == 0: dh = 0
    elif dh > 180: dh -= 360
    elif dh < -180: dh += 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dh / 2))
    Lbp, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    hbp = h1p + h2p
    if C1p * C2p != 0:
        hbp = (h1p + h2p + 360) / 2 if abs(h1p - h2p) > 180 else (h1p + h2p) / 2
    T = 1 - 0.17 * math.cos(math.radians(hbp - 30)) + 0.24 * math.cos(math.radians(2 * hbp)) + 0.32 * math.cos(math.radians(3 * hbp + 6)) - 0.20 * math.cos(math.radians(4 * hbp - 63))
    SL = 1 + 0.015 * (Lbp - 50) ** 2 / math.sqrt(20 + (Lbp - 50) ** 2); SC = 1 + 0.045 * Cbp; SH = 1 + 0.015 * Cbp * T
    RT = -2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * math.sin(math.radians(60 * math.exp(-((hbp - 275) / 25) ** 2)))
    return math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH))

def main():
    write = '--write' in sys.argv
    threshold = float(sys.argv[sys.argv.index('--threshold') + 1]) if '--threshold' in sys.argv else 5.0
    labs = {k: to_lab(v) for k, v in TOKENS.items()}
    before, after, replaced = collections.Counter(), collections.Counter(), 0
    for path in sorted(glob.glob('dist/*.css')):
        if path.endswith('design-system.css'): continue
        src = open(path).read()
        def sub(m):
            nonlocal replaced
            h = m.group(0).lower(); before[h] += 1
            lab = to_lab(h)
            name, d = min(((k, de2000(lab, v)) for k, v in labs.items()), key=lambda kv: kv[1])
            if d < threshold:
                replaced += 1; after['var(--' + name + ')'] += 1
                return f'var(--{name})'
            after[h] += 1
            return m.group(0)
        out = re.sub(r'(?<![\w-])#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', sub, src)
        if write and out != src: open(path, 'w').write(out)
    print(f'threshold {threshold}: {len(before)} distinct colours / {sum(before.values())} uses -> '
          f'{len(after)} distinct values ({replaced} uses now tokens)')

if __name__ == '__main__':
    main()
