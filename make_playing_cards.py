#!/usr/bin/env python3
"""
make_playing_cards.py  –  Crop and composite non-square playing card images.

This script assumes:
  • The playing card faces in cards.png are arranged in a grid.
  • Each tile (card face) has a fixed width and height (they might not be square).
     Update TILE_WIDTH and TILE_HEIGHT below.
  • The blank card background is found in card_back.png, located at a specified
    row and column in the same grid.
  • Rows correspond to suits and columns correspond to ranks, as in:
         ROWS:  ["Hearts", "Clubs", "Diamonds", "Spades"]
         COLS:  ["A", "2", "3", ... , "10", "J", "Q", "K"]
     
Usage:
  1. Place cards.png and card_back.png in the same folder as this script.
  2. Adjust TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y, BLANK_ROW, and BLANK_COL if needed.
  3. Run: python make_playing_cards.py
  4. The composite images will be saved into images/playing/ and also zipped into playing_cards_png.zip.
"""

import os, zipfile
from pathlib import Path
from itertools import product
from PIL import Image
from tqdm import tqdm

# --- Configuration (update these as needed) ---
TILE_WIDTH   = 71    # width of each card face tile in cards.png
TILE_HEIGHT  = 95    # height of each card face tile (non-square)

ORIGIN_X     = 0     # x-coordinate of the top-left corner of the grid in cards.png
ORIGIN_Y     = 0     # y-coordinate of the top-left corner of the grid in cards.png

# The grid layout: 4 rows and 13 columns
ROWS         = ["Hearts", "Clubs", "Diamonds", "Spades"]
COLS         = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

# --- File paths ---
SRC_CARDS = Path("images/cards.png")
SRC_BACK  = Path("images/card_back.png")
OUT_DIR   = Path("images/playing")
ZIP_NAME  = "playing_cards_png.zip"

def main():
    # Check if source images exist.
    if not SRC_CARDS.exists():
        print(f"ERROR: {SRC_CARDS} not found in {Path.cwd()}")
        return
    if not SRC_BACK.exists():
        print(f"ERROR: {SRC_BACK} not found in {Path.cwd()}")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Open source images.
    try:
        sheet = Image.open(SRC_CARDS).convert("RGBA")
    except Exception as e:
        print(f"ERROR opening {SRC_CARDS}: {e}")
        return

    try:
        backs = Image.open(SRC_BACK).convert("RGBA")
    except Exception as e:
        print(f"ERROR opening {SRC_BACK}: {e}")
        return

    # Process each playing card tile.
    tasks = list(product(range(len(ROWS)), range(len(COLS))))
    for r, c in tqdm(tasks, desc="Creating cards", unit="card"):
        left = ORIGIN_X + c * (TILE_WIDTH)
        top  = ORIGIN_Y + r * (TILE_HEIGHT)
        face = sheet.crop((left, top, left + TILE_WIDTH, top + TILE_HEIGHT))
        
        # Composite the card face over the blank background.
        card = face.copy()
        
        filename = f"{COLS[c]}_{ROWS[r]}.png"
        card.save(OUT_DIR / filename)

    print(f"\n✔  Saved {len(tasks)} images in {OUT_DIR}\n")

    # Zip the generated files.
    with zipfile.ZipFile(ZIP_NAME, "w", zipfile.ZIP_DEFLATED) as z:
        for p in OUT_DIR.glob("*.png"):
            z.write(p, p.relative_to(OUT_DIR.parent))
    print(f"✔  Created zip archive: {ZIP_NAME}")

if __name__ == "__main__":
    main()
