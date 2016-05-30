# coding: utf8

import mmh3

symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
# TODO: Используй itertools, Luke
cross_product = set()
for s in symbols:
    for s2 in symbols:
        for s3 in symbols:
            cross_product.add(s + s2 + s3)

hashes = {}
lengths = {}
u1 = set()
u2 = set()
u3 = set()
u4 = set()
u5 = set()
slider = []
for i in range(100):
    slider.append(set())
word_counter = 0

with open("words.txt", 'r', encoding="utf8") as f:
    for word in f:
        word = word.upper().strip()
        hash = mmh3.hash(word.encode("utf8")) // 111
        hash %= 3749835
        if hash in hashes:
            hashes[hash].append(word)
        else:
            hashes[hash] = [word]
        l = len(word)
        if l in lengths:
            lengths[l] += 1
        else:
            lengths[l] = 1
        min_length = 3
        while True:
            if len(word) >= min_length:
                slider[min_length - 3].add(word[min_length - 3:min_length])
                min_length += 1
            else:
                break
        word_counter += 1

print("unique keys: " + str(len(hashes)))
print("words count: " + str(word_counter))
print("MAX key: " + str(max(hashes.keys())))
print("MIN key: " + str(min(hashes.keys())))
print(lengths)
print("U: " + str(len(u1)) + " " + str(len(u2)) + " " + str(len(u3)) + " " + str(len(u4)) + " " + str(len(u5)))
with open("slider.txt", "w+") as f:
    for i in range(100):
        slider_part = slider[i]
        if i <= 15:
            raw = sorted(list(slider_part))
        else:
            raw = sorted(list(slider_part))
        result = ""
        for fbd in raw:
            result += fbd + ","
        f.write(result)
        f.write('\n')


l16 = 0
for l in lengths:
    if l > 16:
        l16 += lengths[l]
print("Length > 16 count: " + str(l16))

plain_hashes = sorted([key for key in hashes])
from PIL import Image, ImageColor

modifier = 1000
size = (plain_hashes[-1] // modifier) + 1, modifier
print("Image size: " + str(size))
img = Image.new("1", size=size)
clr = ImageColor.getcolor(color="white", mode="1")
for h in plain_hashes:
    xy = (h // modifier, h % modifier)
    img.putpixel(xy, clr)

img.save("imm.png", compress_leve=9)


# plain_hashes = sorted([key for key in hashes])
# minimum = abs(min(plain_hashes))
# plain_hashes = [h + minimum for h in plain_hashes]
# print("First one: " + str(plain_hashes[0]) + " last one: " + str(plain_hashes[-1]))
#
# print(str(plain_hashes[0]) + " " + str(plain_hashes[1]) + " " + str(plain_hashes[2]))
#
# plen = len(plain_hashes)
# plen10 = plen // 10
# for i in range(10):
#     doubled = ['0'] * (plain_hashes[i * plen10:(i + 1) * plen10][-1] + 1)
#     print("YAY ready " + str(10))
#     counter = 0
#     for h in plain_hashes[i * plen10:(i + 1) * plen10]:
#         if counter % 10000 == 0:
#             print(counter)
#         doubled[h] = '1'
#         counter += 1
#
#     with open("res_" + str(i), "w+") as f:
#         f.write(str(int(''.join(doubled), 2)))
