"""
Génère les assets PNG du logo Sauve-Vie (L'Insigne Protecteur).
Requiert : pip install Pillow
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')

# ── Couleurs ─────────────────────────────────────────────────────────────────
SHIELD_DARK   = (13,  27,  53)   # bleu nuit profond
SHIELD_MID    = (26,  42,  74)   # bleu nuit clair
RED_DEEP      = (183, 28,  28)   # rouge profond
RED_BRIGHT    = (229, 57,  53)   # rouge vif
BLUE_ACCENT   = (74, 111, 165)   # bleu acier
WHITE         = (255, 255, 255)
TRANSPARENT   = (0, 0, 0, 0)


def shield_polygon(cx, cy, w, h):
    """Points d'un bouclier héraldique centré en (cx,cy), largeur w, hauteur h."""
    top    = cy - h // 2
    bottom = cy + h // 2
    left   = cx - w // 2
    right  = cx + w // 2
    mid_y  = top + int(h * 0.55)

    pts = []
    # Côté gauche (arrondi simulé avec plusieurs points)
    pts.append((left,  top + int(h * 0.12)))
    pts.append((left,  mid_y))
    # Arrondi bas-gauche
    steps = 20
    for i in range(steps + 1):
        angle = math.pi + (math.pi / 2) * (i / steps)   # 180° → 270°
        rx = w * 0.50
        ry = h * 0.55
        px = cx + rx * math.cos(angle)
        py = cy + h * 0.10 + ry * abs(math.sin(angle))
        pts.append((px, py))
    # Côté droit
    pts.append((right, mid_y))
    pts.append((right, top + int(h * 0.12)))
    # Haut
    pts.append((cx,    top))
    return [(int(x), int(y)) for x, y in pts]


def draw_drop(draw, cx, cy, half_w, height, color):
    """Dessine une goutte de sang (croix verticale avec pointe vers le bas)."""
    top    = cy - height // 2
    body_h = int(height * 0.65)
    # Corps arrondi (rectangle à bords arrondis)
    r = half_w
    body_rect = [cx - half_w, top, cx + half_w, top + body_h]
    draw.rounded_rectangle(body_rect, radius=r, fill=color)
    # Pointe triangulaire vers le bas
    tip_y = top + height
    triangle = [
        (cx - half_w, top + body_h - 4),
        (cx + half_w, top + body_h - 4),
        (cx,          tip_y),
    ]
    draw.polygon(triangle, fill=color)


def draw_logo(size=1024, bg=SHIELD_DARK, transparent_bg=False):
    """Retourne une image PIL avec le logo Sauve-Vie."""
    img  = Image.new('RGBA', (size, size), (0, 0, 0, 0) if transparent_bg else bg + (255,))
    draw = ImageDraw.Draw(img)

    cx   = size // 2
    cy   = int(size * 0.46)
    sw   = int(size * 0.74)   # largeur bouclier
    sh   = int(size * 0.78)   # hauteur bouclier

    # ── Bouclier ─────────────────────────────────────────────────────────────
    pts = shield_polygon(cx, cy, sw, sh)
    draw.polygon(pts, fill=SHIELD_MID)

    # Contour bleu acier
    draw.polygon(pts, outline=BLUE_ACCENT + (160,), width=max(3, size // 150))

    # Reflet intérieur subtil (bouclier légèrement plus petit, trait blanc transparent)
    pts_inner = shield_polygon(cx, cy, int(sw * 0.92), int(sh * 0.92))
    draw.polygon(pts_inner, outline=(255, 255, 255, 20), width=max(2, size // 200))

    # ── Croix : barre horizontale ─────────────────────────────────────────────
    bar_h  = int(size * 0.09)
    bar_w  = int(size * 0.44)
    bar_r  = bar_h // 2
    bar_cy = int(cy + size * 0.02)
    bar_rect = [cx - bar_w // 2, bar_cy - bar_h // 2,
                cx + bar_w // 2, bar_cy + bar_h // 2]
    draw.rounded_rectangle(bar_rect, radius=bar_r, fill=RED_BRIGHT)
    # Ligne horizon blanche au centre
    lw = max(2, size // 300)
    draw.line([(cx - bar_w // 2 + bar_r, bar_cy),
               (cx + bar_w // 2 - bar_r, bar_cy)],
              fill=(255, 255, 255, 60), width=lw)

    # ── Croix : goutte (branche verticale) ────────────────────────────────────
    drop_half_w = int(size * 0.085)
    drop_h      = int(size * 0.42)
    drop_top_cy = int(cy - size * 0.09)
    draw_drop(draw, cx, drop_top_cy, drop_half_w, drop_h, RED_DEEP)
    # Reflet brillant sur la goutte
    shine_rx = max(3, size // 80)
    shine_ry = max(5, size // 50)
    shine_cx = cx - drop_half_w // 3
    shine_cy = drop_top_cy - drop_h // 4
    draw.ellipse([shine_cx - shine_rx, shine_cy - shine_ry,
                  shine_cx + shine_rx, shine_cy + shine_ry],
                 fill=(255, 255, 255, 55))

    # ── Texte "Sauve-Vie" ─────────────────────────────────────────────────────
    font_size_main = max(12, int(size * 0.095))
    font_size_sub  = max(8,  int(size * 0.038))
    try:
        font_main = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", font_size_main)
        font_sub  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",     font_size_sub)
    except Exception:
        font_main = ImageFont.load_default()
        font_sub  = ImageFont.load_default()

    text_y = int(cy + sh * 0.45)

    # Ombre texte
    for dx, dy in [(-2, 2), (2, 2), (0, 3)]:
        draw.text((cx + dx, text_y + dy), "Sauve-Vie",
                  font=font_main, fill=(0, 0, 0, 100), anchor="mm")
    draw.text((cx, text_y), "Sauve-Vie",
              font=font_main, fill=RED_DEEP, anchor="mm")

    sub_y = text_y + int(font_size_main * 0.9)
    draw.text((cx, sub_y), "D O N   D E   S A N G",
              font=font_sub, fill=BLUE_ACCENT, anchor="mm")

    return img


def save(img, path, size=None):
    if size:
        img = img.resize((size, size), Image.LANCZOS)
    img.save(path)
    print(f"  ✓ {path}  ({img.size[0]}×{img.size[1]})")


if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ── icon.png — 1024×1024 fond foncé ──────────────────────────────────────
    logo_1024 = draw_logo(1024)
    save(logo_1024, os.path.join(OUTPUT_DIR, 'icon.png'))

    # ── splash-icon.png — 200×200 centré sur fond blanc ──────────────────────
    splash_bg = Image.new('RGBA', (200, 200), (255, 255, 255, 255))
    logo_small = draw_logo(160).convert('RGBA')
    splash_bg.paste(logo_small, (20, 20), logo_small)
    save(splash_bg, os.path.join(OUTPUT_DIR, 'splash-icon.png'))

    # ── android-icon-foreground.png — 1024×1024 fond transparent ─────────────
    logo_fg = draw_logo(1024, transparent_bg=True)
    save(logo_fg, os.path.join(OUTPUT_DIR, 'android-icon-foreground.png'))

    # ── android-icon-background.png — 1024×1024 couleur unie ─────────────────
    bg_img = Image.new('RGBA', (1024, 1024), SHIELD_DARK + (255,))
    save(bg_img, os.path.join(OUTPUT_DIR, 'android-icon-background.png'))

    # ── android-icon-monochrome.png — 1024×1024 blanc sur transparent ─────────
    mono = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    mono_draw = ImageDraw.Draw(mono)
    pts = shield_polygon(512, 472, 760, 800)
    mono_draw.polygon(pts, fill=(255, 255, 255, 255))
    save(mono, os.path.join(OUTPUT_DIR, 'android-icon-monochrome.png'))

    # ── favicon.png — 48×48 ───────────────────────────────────────────────────
    save(logo_1024, os.path.join(OUTPUT_DIR, 'favicon.png'), size=48)

    print("\nTous les assets ont été générés dans /assets/")
