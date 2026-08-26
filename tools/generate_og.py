"""fadd9 OGP 画像生成スクリプト (1200x630)"""
from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1200, 630

# カラー
NAVY = (10, 14, 26)
NAVY_LIGHT = (16, 22, 39)
TEAL = (45, 212, 191)
MOONLIGHT = (253, 230, 138)
WHITE = (232, 236, 244)
GRAY = (154, 165, 189)

img = Image.new("RGB", (W, H), NAVY)
draw = ImageDraw.Draw(img)

# 背景グラデーション
for y in range(H):
    r = int(NAVY[0] + (NAVY_LIGHT[0] - NAVY[0]) * (y / H))
    g = int(NAVY[1] + (NAVY_LIGHT[1] - NAVY[1]) * (y / H))
    b = int(NAVY[2] + (NAVY_LIGHT[2] - NAVY[2]) * (y / H))
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# コード図風の装飾（右上）
cx, cy = W - 180, 160
# ストリング
for i in range(6):
    x = cx - 60 + i * 24
    draw.line([(x, cy - 80), (x, cy + 80)], fill=GRAY, width=2)
# フレット
for i in range(5):
    y = cy - 80 + i * 40
    draw.line([(cx - 60, y), (cx + 60, y)], fill=GRAY, width=1)
# 押弦ドット（Fadd9: x x 3 2 1 3）
frets = [None, None, 3, 2, 1, 3]
for i, f in enumerate(frets):
    if f is not None:
        x = cx - 60 + i * 24
        y = cy - 80 + (5 - f) * 40
        draw.ellipse([x - 8, y - 8, x + 8, y + 8], fill=MOONLIGHT)

# ロゴタイプ
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 48)
    font_tag = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 20)
    font_small = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 14)
except:
    font_large = ImageFont.load_default()
    font_tag = font_large
    font_small = font_large

draw.text((80, 120), "fadd9", fill=TEAL, font=font_large)
draw.text((80, 190), "Guitar, notated.", fill=WHITE, font=font_tag)
draw.text((80, 230), "ABC記法で書くギターの独習ライブラリ", fill=GRAY, font=font_small)

# 装飾ライン
draw.line([(80, 270), (300, 270)], fill=TEAL, width=2)

img.save("og.png", "PNG")
print("Generated og.png (1200x630)")