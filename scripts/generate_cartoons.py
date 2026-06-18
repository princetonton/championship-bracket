from PIL import Image, ImageDraw
import math, os, random

OUT = "public/images/cartoons"
os.makedirs(OUT, exist_ok=True)

W, H = 200, 250

def draw_ronaldo():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    skin = (212, 165, 116)
    hair = (42, 26, 10)
    dark_hair = (30, 18, 6)
    eye_c = (50, 30, 15)
    white = (245, 245, 235)
    lip = (180, 120, 90)
    jersey = (218, 41, 28)
    jersey_dark = (180, 30, 20)
    green = (0, 102, 0)
    gold = (218, 165, 32)

    # Neck
    d.polygon([(85, 150), (115, 150), (120, 195), (80, 195)], fill=skin)

    # Jersey
    d.polygon([(55, 180), (145, 180), (155, 250), (45, 250)], fill=jersey)
    d.polygon([(55, 180), (145, 180), (140, 195), (60, 195)], fill=jersey_dark)
    d.polygon([(70, 180), (80, 190), (72, 195)], fill=green)
    d.polygon([(130, 180), (120, 190), (128, 195)], fill=green)

    # Head oval
    d.ellipse([68, 38, 132, 148], fill=skin)
    # Jaw
    d.polygon([(68, 110), (65, 130), (72, 148), (80, 155), (100, 158), (120, 155), (128, 148), (135, 130), (132, 110)], fill=skin)

    # Ears
    d.ellipse([60, 80, 70, 100], fill=skin)
    d.ellipse([130, 80, 140, 100], fill=skin)
    d.ellipse([63, 84, 68, 94], fill=(190, 145, 100))
    d.ellipse([132, 84, 137, 94], fill=(190, 145, 100))

    # Hair - side swoop
    d.polygon([62, 60, 68, 36, 78, 26, 95, 22, 112, 24, 125, 30, 135, 44, 138, 58, 140, 70, 138, 80, 135, 68, 128, 52, 118, 38, 100, 34, 82, 38, 72, 48, 66, 62, 62, 70], fill=hair)
    d.polygon([100, 24, 108, 20, 120, 22, 130, 30, 136, 42, 140, 56, 140, 70, 135, 58, 128, 42, 118, 32, 105, 28], fill=dark_hair)
    d.polygon([70, 58, 74, 48, 82, 40, 95, 36, 82, 44, 74, 54, 70, 62], fill=dark_hair)

    # Eyebrows
    d.polygon([(78, 86), (84, 82), (96, 80), (105, 82), (112, 84), (110, 86), (104, 84), (96, 82), (86, 84), (80, 88)], fill=hair)
    d.polygon([(120, 86), (125, 82), (132, 80), (140, 82), (143, 85), (140, 86), (134, 84), (127, 82), (122, 86)], fill=hair)

    # Eyes
    d.ellipse([78, 90, 100, 102], fill=white)
    d.ellipse([84, 94, 94, 100], fill=eye_c)
    d.ellipse([87, 96, 91, 99], fill=(30, 20, 10))
    d.point([89, 97], fill=(255, 255, 255))
    d.polygon([(76, 90), (82, 88), (96, 88), (102, 90), (100, 93), (96, 91), (82, 91), (78, 93)], fill=skin)

    d.ellipse([108, 90, 130, 102], fill=white)
    d.ellipse([114, 94, 124, 100], fill=eye_c)
    d.ellipse([117, 96, 121, 99], fill=(30, 20, 10))
    d.point([119, 97], fill=(255, 255, 255))
    d.polygon([(106, 90), (112, 88), (126, 88), (132, 90), (130, 93), (126, 91), (112, 91), (108, 93)], fill=skin)

    # Nose
    d.polygon([(96, 100), (98, 115), (100, 125), (102, 115), (104, 100)], fill=(190, 148, 104))
    d.ellipse([(90, 118), (96, 123)], fill=(160, 120, 80))
    d.ellipse([(104, 118), (110, 123)], fill=(160, 120, 80))
    d.polygon([(97, 102), (99, 114), (101, 114), (103, 102)], fill=(220, 175, 125))

    # Mouth
    d.polygon([(88, 134), (96, 132), (104, 131), (112, 132), (118, 134)], fill=lip)
    d.polygon([(88, 134), (96, 133), (104, 132), (112, 133), (118, 134)], fill=(160, 105, 75))
    d.polygon([(90, 135), (104, 134), (116, 136)], fill=(200, 135, 100))

    # Stubble
    st = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st)
    sd.polygon([(70, 130), (68, 140), (72, 150), (82, 156), (100, 158), (118, 156), (128, 150), (132, 140), (130, 130)], fill=(139, 96, 48, 60))
    for _ in range(200):
        x = 72 + int(random.random() * 56)
        y = 128 + int(random.random() * 30)
        sd.point((x, y), fill=(100, 68, 30, 120))
    img = Image.alpha_composite(img, st)

    final = Image.new("RGB", (W, H), (10, 14, 26))
    final.paste(img, (0, 0), img)
    final.save(f"{OUT}/ronaldo.jpg", quality=92)
    print("ronaldo.jpg")


def draw_messi():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    skin = (232, 184, 138)
    hair = (60, 31, 14)
    eye_c = (40, 25, 12)
    white = (240, 240, 230)
    jersey_b = (117, 170, 219)
    jersey_w = (245, 245, 240)

    d.polygon([(85, 152), (115, 152), (120, 195), (80, 195)], fill=skin)

    d.polygon([(52, 182), (148, 182), (156, 250), (44, 250)], fill=jersey_b)
    for i in range(5):
        y_off = 182 + i * 14
        fill_c = jersey_w if i % 2 == 0 else jersey_b
        d.polygon([(52, y_off), (148, y_off), (148, y_off + 7), (52, y_off + 7)], fill=fill_c)

    d.ellipse([62, 40, 138, 155], fill=skin)
    d.ellipse([56, 85, 66, 105], fill=skin)
    d.ellipse([134, 85, 144, 105], fill=skin)
    d.ellipse([59, 90, 64, 100], fill=(200, 155, 115))
    d.ellipse([136, 90, 141, 100], fill=(200, 155, 115))

    # Hair
    d.polygon([58, 65, 62, 42, 72, 30, 88, 24, 105, 22, 120, 26, 132, 36, 140, 52, 142, 68, 140, 78, 136, 66, 130, 52, 120, 38, 105, 32, 90, 34, 76, 42, 66, 56, 60, 70, 58, 78], fill=hair)
    d.polygon([88, 26, 100, 22, 115, 24, 125, 30, 118, 32, 105, 28, 92, 30], fill=(45, 22, 10))

    # Beard
    beard = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beard)
    bd.polygon([(70, 98), (66, 110), (64, 125), (68, 140), (76, 150), (90, 155), (110, 155), (124, 150), (132, 140), (136, 125), (134, 110), (130, 98)], fill=(60, 31, 14, 180))
    for _ in range(150):
        x = 70 + int(random.random() * 60)
        y = 105 + int(random.random() * 48)
        bd.point((x, y), fill=(45, 22, 10, 200))
    img = Image.alpha_composite(img, beard)

    d.polygon([(80, 82), (88, 78), (100, 76), (108, 78), (112, 82), (110, 84), (104, 80), (92, 78), (82, 82), (78, 84)], fill=hair)
    d.polygon([(118, 82), (124, 78), (132, 76), (138, 78), (140, 82), (138, 84), (134, 80), (126, 78), (120, 82)], fill=hair)

    d.ellipse([80, 88, 100, 102], fill=white)
    d.ellipse([86, 93, 94, 100], fill=eye_c)
    d.ellipse([89, 95, 91, 98], fill=(25, 15, 8))
    d.point([90, 96], fill=(255, 255, 255))

    d.ellipse([108, 88, 128, 102], fill=white)
    d.ellipse([114, 93, 122, 100], fill=eye_c)
    d.ellipse([117, 95, 119, 98], fill=(25, 15, 8))
    d.point([118, 96], fill=(255, 255, 255))

    d.polygon([(96, 100), (98, 118), (100, 124), (102, 118), (104, 100)], fill=(200, 158, 118))
    d.ellipse([94, 118, 106, 126], fill=(200, 158, 118))
    d.ellipse([(96, 120), (100, 124)], fill=(170, 130, 95))
    d.ellipse([(100, 120), (104, 124)], fill=(170, 130, 95))

    d.polygon([(90, 132), (96, 130), (104, 129), (112, 130), (118, 132)], fill=(170, 115, 85))
    d.polygon([(92, 134), (104, 132), (116, 134)], fill=(200, 140, 105))

    final = Image.new("RGB", (W, H), (10, 14, 26))
    final.paste(img, (0, 0), img)
    final.save(f"{OUT}/messi.jpg", quality=92)
    print("messi.jpg")


def draw_kane():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    skin = (240, 200, 160)
    hair = (180, 148, 88)
    eye_c = (50, 70, 130)
    white = (245, 245, 240)
    jersey_w = (250, 250, 245)
    red = (200, 16, 46)

    d.polygon([(84, 148), (116, 148), (120, 192), (80, 192)], fill=skin)

    d.polygon([(52, 180), (148, 180), (156, 250), (44, 250)], fill=jersey_w)
    d.polygon([(52, 180), (148, 180), (148, 190), (52, 190)], fill=red)
    d.polygon([(52, 238), (148, 238), (148, 250), (52, 250)], fill=red)
    d.polygon([(96, 180), (104, 180), (104, 250), (96, 250)], fill=red)

    d.ellipse([64, 38, 136, 152], fill=skin)
    d.ellipse([58, 82, 68, 102], fill=skin)
    d.ellipse([132, 82, 142, 102], fill=skin)
    d.ellipse([61, 87, 66, 97], fill=(210, 170, 135))
    d.ellipse([134, 87, 139, 97], fill=(210, 170, 135))

    d.polygon([60, 62, 64, 40, 74, 28, 90, 22, 108, 22, 122, 28, 132, 42, 138, 60, 140, 72, 136, 60, 128, 42, 116, 32, 100, 28, 84, 30, 72, 40, 64, 56, 60, 68], fill=hair)
    d.polygon([90, 24, 100, 22, 110, 24, 120, 30, 112, 30, 100, 26, 90, 28], fill=(160, 128, 70))

    d.polygon([(80, 80), (90, 78), (100, 78), (108, 80), (110, 82), (108, 84), (100, 80), (90, 80), (82, 82)], fill=hair)
    d.polygon([(118, 80), (126, 78), (134, 80), (136, 82), (134, 84), (128, 80), (120, 82)], fill=hair)

    d.ellipse([78, 88, 98, 102], fill=white)
    d.ellipse([84, 93, 94, 100], fill=eye_c)
    d.ellipse([88, 95, 90, 98], fill=(30, 40, 80))
    d.point([89, 96], fill=(255, 255, 255))
    d.polygon([(78, 88), (86, 86), (98, 86), (104, 88), (100, 91), (96, 88), (84, 88), (80, 91)], fill=skin)

    d.ellipse([108, 88, 128, 102], fill=white)
    d.ellipse([114, 93, 124, 100], fill=eye_c)
    d.ellipse([118, 95, 120, 98], fill=(30, 40, 80))
    d.point([119, 96], fill=(255, 255, 255))

    # Crooked nose
    d.polygon([(96, 100), (98, 108), (96, 114), (92, 120), (100, 126), (104, 118), (102, 108), (104, 100)], fill=(210, 172, 135))
    d.ellipse([(90, 119), (95, 124)], fill=(175, 138, 108))
    d.ellipse([(104, 119), (108, 124)], fill=(175, 138, 108))

    d.polygon([(90, 132), (98, 130), (104, 130), (110, 131), (116, 133)], fill=(175, 125, 95))
    d.polygon([(92, 134), (104, 132), (114, 134)], fill=(200, 145, 110))

    final = Image.new("RGB", (W, H), (10, 14, 26))
    final.paste(img, (0, 0), img)
    final.save(f"{OUT}/kane.jpg", quality=92)
    print("kane.jpg")


def draw_haaland():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    skin = (240, 208, 176)
    hair = (220, 212, 188)
    dark_hair = (200, 192, 168)
    eye_c = (60, 80, 110)
    white = (245, 245, 240)
    jersey_r = (186, 12, 47)
    jersey_b = (0, 48, 135)

    d.polygon([(84, 150), (116, 150), (120, 195), (80, 195)], fill=skin)

    d.polygon([(50, 180), (150, 180), (158, 250), (42, 250)], fill=jersey_r)
    d.polygon([(96, 180), (104, 180), (104, 250), (96, 250)], fill=jersey_b)
    d.polygon([(50, 210), (150, 210), (150, 220), (50, 220)], fill=jersey_b)

    d.ellipse([66, 42, 134, 148], fill=skin)
    d.polygon([(66, 110), (64, 122), (68, 138), (76, 148), (90, 154), (110, 154), (124, 148), (132, 138), (136, 122), (134, 110)], fill=skin)

    d.ellipse([60, 80, 70, 100], fill=skin)
    d.ellipse([130, 80, 140, 100], fill=skin)

    # Long hair + bun
    d.polygon([58, 56, 62, 34, 72, 26, 88, 22, 100, 20, 112, 22, 124, 28, 134, 40, 140, 56, 140, 70, 138, 80, 134, 68, 128, 50, 118, 36, 100, 30, 82, 34, 70, 46, 62, 60], fill=hair)
    d.ellipse([90, 8, 110, 26], fill=hair)
    d.ellipse([92, 6, 112, 24], fill=dark_hair)
    d.polygon([(72, 28), (80, 18), (90, 12), (100, 10), (96, 16), (88, 20), (78, 26)], fill=hair)
    d.polygon([(128, 30), (120, 18), (112, 14), (104, 12), (108, 18), (116, 22), (126, 30)], fill=hair)
    d.polygon([(62, 40), (64, 30), (70, 24), (68, 32), (64, 42)], fill=dark_hair)
    d.polygon([(136, 40), (134, 30), (128, 24), (130, 32), (134, 42)], fill=dark_hair)

    d.polygon([(80, 80), (90, 78), (100, 78), (108, 80), (110, 82), (108, 84), (100, 80), (90, 80), (82, 82)], fill=dark_hair)
    d.polygon([(118, 80), (126, 78), (134, 80), (136, 82), (134, 84), (128, 80), (120, 82)], fill=dark_hair)

    d.ellipse([78, 88, 98, 102], fill=white)
    d.ellipse([84, 93, 94, 100], fill=eye_c)
    d.ellipse([88, 96, 91, 99], fill=(30, 40, 70))
    d.point([89, 97], fill=(255, 255, 255))

    d.ellipse([108, 88, 128, 102], fill=white)
    d.ellipse([114, 93, 124, 100], fill=eye_c)
    d.ellipse([118, 96, 121, 99], fill=(30, 40, 70))
    d.point([119, 97], fill=(255, 255, 255))

    d.polygon([(96, 100), (98, 112), (100, 124), (102, 112), (104, 100)], fill=(210, 178, 150))
    d.ellipse([(92, 120), (98, 125)], fill=(180, 150, 125))
    d.ellipse([(102, 120), (108, 125)], fill=(180, 150, 125))

    d.polygon([(92, 132), (100, 130), (104, 130), (110, 131), (116, 133)], fill=(170, 130, 100))
    d.polygon([(94, 134), (100, 132), (108, 133), (114, 135)], fill=(200, 155, 120))

    st = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st)
    for _ in range(120):
        x = 72 + int(random.random() * 56)
        y = 130 + int(random.random() * 24)
        sd.point((x, y), fill=(180, 160, 140, 80))
    img = Image.alpha_composite(img, st)

    final = Image.new("RGB", (W, H), (10, 14, 26))
    final.paste(img, (0, 0), img)
    final.save(f"{OUT}/haaland.jpg", quality=92)
    print("haaland.jpg")


def draw_mbappe():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    skin = (139, 108, 66)
    hair = (26, 10, 0)
    eye_c = (30, 20, 10)
    white = (245, 245, 235)
    lip = (155, 95, 70)
    jersey_b = (0, 35, 149)
    jersey_w = (250, 250, 245)
    jersey_r = (237, 41, 57)

    d.polygon([(84, 150), (116, 150), (120, 195), (80, 195)], fill=skin)

    d.polygon([(50, 180), (80, 180), (80, 250), (42, 250)], fill=jersey_b)
    d.polygon([(80, 180), (120, 180), (120, 250), (80, 250)], fill=jersey_w)
    d.polygon([(120, 180), (150, 180), (158, 250), (120, 250)], fill=jersey_r)

    d.ellipse([64, 38, 136, 152], fill=skin)
    d.ellipse([58, 82, 68, 102], fill=skin)
    d.ellipse([132, 82, 142, 102], fill=skin)
    d.ellipse([61, 87, 66, 97], fill=(115, 88, 52))
    d.ellipse([134, 87, 139, 97], fill=(115, 88, 52))

    d.polygon([58, 58, 62, 34, 72, 24, 88, 20, 95, 20, 95, 30, 108, 20, 122, 26, 132, 38, 140, 56, 142, 70, 138, 58, 130, 42, 118, 32, 100, 28, 88, 28, 76, 38, 66, 52, 60, 66], fill=hair)
    # Hard part
    d.polygon([(95, 20), (96, 30), (96, 38), (94, 38), (94, 30), (93, 20)], fill=(180, 155, 130))

    d.polygon([(80, 78), (90, 76), (100, 76), (108, 78), (112, 80), (108, 82), (100, 78), (90, 78), (82, 80)], fill=hair)
    d.polygon([(118, 78), (126, 76), (134, 78), (136, 80), (134, 82), (128, 78), (120, 80)], fill=hair)

    d.ellipse([80, 86, 100, 100], fill=white)
    d.ellipse([86, 91, 94, 98], fill=eye_c)
    d.ellipse([89, 93, 91, 96], fill=(20, 12, 5))
    d.point([90, 94], fill=(255, 255, 255))

    d.ellipse([110, 86, 130, 100], fill=white)
    d.ellipse([116, 91, 124, 98], fill=eye_c)
    d.ellipse([119, 93, 121, 96], fill=(20, 12, 5))
    d.point([120, 94], fill=(255, 255, 255))

    d.polygon([(96, 100), (98, 112), (100, 122), (102, 112), (104, 100)], fill=(118, 90, 54))
    d.ellipse([(93, 118), (98, 123)], fill=(100, 74, 42))
    d.ellipse([(102, 118), (107, 123)], fill=(100, 74, 42))

    # Smile with teeth
    d.polygon([(84, 128), (92, 124), (100, 122), (108, 123), (116, 126), (120, 130)], fill=lip)
    d.polygon([(88, 128), (92, 126), (100, 125), (108, 126), (114, 128), (112, 130), (108, 128), (100, 127), (92, 128), (90, 130)], fill=(250, 245, 235))
    d.polygon([(88, 130), (92, 128), (100, 127), (108, 128), (114, 130), (112, 132), (108, 130), (100, 129), (92, 130), (90, 132)], fill=lip)
    d.polygon([(90, 132), (100, 131), (110, 132), (115, 134), (110, 136), (100, 135), (92, 136)], fill=(140, 82, 58))

    final = Image.new("RGB", (W, H), (10, 14, 26))
    final.paste(img, (0, 0), img)
    final.save(f"{OUT}/mbappe.jpg", quality=92)
    print("mbappe.jpg")


if __name__ == "__main__":
    draw_ronaldo()
    draw_messi()
    draw_kane()
    draw_haaland()
    draw_mbappe()
    print("Alle Cartoons generiert in", OUT)
