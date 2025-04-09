"""
download_jokers.py
------------------
Download every Joker PNG from the Balatro wiki.

Usage
=====
1. Put this script in an empty folder (or in your project root).
2. Edit the `JOKER_NAMES` list if you want only a subset.
3. Run: python download_jokers.py
4. You’ll get a folder jokers/ filled with <Name>.png files (with underscores in the filename).
"""

import re, os, requests, bs4
from pathlib import Path
from tqdm import tqdm

# --------------------------------------------------------------------------
# 1) List every Joker name exactly as you want the saved filename to appear
# --------------------------------------------------------------------------
JOKER_NAMES = [
    "Joker",
    "Greedy Joker",
    "Lusty Joker",
    "Wrathful Joker",
    "Gluttonous Joker",
    "Jolly Joker",
    "Zany Joker",
    "Mad Joker",
    "Crazy Joker",
    "Droll Joker",
    "Sly Joker",
    "Wily Joker",
    "Clever Joker",
    "Devious Joker",
    "Crafty Joker",
    "Half Joker",
    "Joker Stencil",
    "Four Fingers",
    "Mime",
    "Credit Card",
    "Ceremonial Dagger",
    "Banner",
    "Mystic Summit",
    "Marble Joker",
    "Loyalty Card",
    "8 Ball",
    "Misprint",
    "Dusk",
    "Raised Fist",
    "Chaos the Clown",
    "Fibonacci",
    "Steel Joker",
    "Scary Face",
    "Abstract Joker",
    "Delayed Gratification",
    "Hack",
    "Pareidolia",
    "Gros Michel",
    "Even Steven",
    "Odd Todd",
    "Scholar",
    "Business Card",
    "Supernova",
    "Ride the Bus",
    "Space Joker",
    "Egg",
    "Burglar",
    "Blackboard",
    "Runner",
    "Ice Cream",
    "DNA",
    "Splash",
    "Blue Joker",
    "Sixth Sense",
    "Constellation",
    "Hiker",
    "Faceless Joker",
    "Green Joker",
    "Superposition",
    "To Do List",
    "Cavendish",
    "Card Sharp",
    "Red Card",
    "Madness",
    "Square Joker",
    "Séance",
    "Riff-Raff",
    "Vampire",
    "Shortcut",
    "Hologram",
    "Vagabond",
    "Baron",
    "Cloud 9",
    "Rocket",
    "Obelisk",
    "Midas Mask",
    "Luchador",
    "Photograph",
    "Gift Card",
    "Turtle Bean",
    "Erosion",
    "Reserved Parking",
    "Mail-In Rebate",
    "To the Moon",
    "Hallucination",
    "Fortune Teller",
    "Juggler",
    "Drunkard",
    "Stone Joker",
    "Golden Joker",
    "Lucky Cat",
    "Baseball Card",
    "Bull",
    "Diet Cola",
    "Trading Card",
    "Flash Card",
    "Popcorn",
    "Spare Trousers",
    "Ancient Joker",
    "Ramen",
    "Walkie Talkie",
    "Seltzer",
    "Castle",
    "Smiley Face",
    "Campfire",
    "Golden Ticket",
    "Mr. Bones",
    "Acrobat",
    "Sock and Buskin",
    "Swashbuckler",
    "Troubadour",
    "Certificate",
    "Smeared Joker",
    "Throwback",
    "Hanging Chad",
    "Rough Gem",
    "Bloodstone",
    "Arrowhead",
    "Onyx Agate",
    "Glass Joker",
    "Showman",
    "Flower Pot",
    "Blueprint",
    "Wee Joker",
    "Merry Andy",
    "Oops! All 6s",
    "The Idol",
    "Seeing Double",
    "Matador",
    "Hit the Road",
    "The Duo",
    "The Trio",
    "The Family",
    "The Order",
    "The Tribe",
    "Stuntman",
    "Invisible Joker",
    "Brainstorm",
    "Satellite",
    "Shoot the Moon",
    "Driver's License",
    "Cartomancer",
    "Astronomer",
    "Burnt Joker",
    "Bootstraps",
    "Canio",
    "Triboulet",
    "Yorick",
    "Chicot",
    "Perkeo"
]

# --------------------------------------------------------------------------
# 2) Where to save the files
# --------------------------------------------------------------------------
OUT_DIR = Path("images/jokers")  # Folder where images will be saved

# --------------------------------------------------------------------------
# 3) Simple helpers
# --------------------------------------------------------------------------
UA = "Balatro-Helper-Image-Grab (+github example)"
session = requests.Session()
session.headers["User-Agent"] = UA

def slugify(name: str) -> str:
    """
    Replace any whitespace with a single underscore and remove leading/trailing space.
    """
    return re.sub(r"\s+", "_", name.strip())

def name_to_url(name: str) -> str:
    """
    Convert a Joker name into its wiki URL.
    E.g. "Greedy Joker" -> "https://balatrogame.fandom.com/wiki/Greedy_Joker?file=Greedy_Joker.png"
    """
    slug = slugify(name)
    return f"https://balatrogame.fandom.com/wiki/{slug}?file={slug}.png"

def sanitize_ext(url: str) -> str:
    """Return the extension from the URL (default to .png if empty)"""
    ext = os.path.splitext(url)[1].split("?")[0]
    return ext if ext else ".png"

# --------------------------------------------------------------------------
# 4) Main download loop
# --------------------------------------------------------------------------
def main():
    OUT_DIR.mkdir(exist_ok=True)

    downloaded = 0
    for name in tqdm(JOKER_NAMES, desc="Downloading", unit="joker"):
        url = name_to_url(name)  # Build the wiki page URL
        try:
            page = session.get(url, timeout=20)
            page.raise_for_status()
        except Exception as e:
            tqdm.write(f"⚠  {name}: page fetch failed ({e})")
            continue

        soup = bs4.BeautifulSoup(page.text, "html.parser")

        # Look for the first image in the infobox (which has the thumbnail)
        img_tag = soup.select_one(".pi-image-thumbnail") or soup.find("img")
        if not img_tag or not img_tag.get("src"):
            tqdm.write(f"⚠  {name}: image tag not found")
            continue

        # Strip the revision suffix to get the original image URL
        full_url = re.sub(r"/revision/.*", "", img_tag["src"])
        ext = sanitize_ext(full_url)
        # Use slugify to construct the filename with underscores
        slug = slugify(name)
        out_path = OUT_DIR / f"{slug}{ext}"

        try:
            img_data = session.get(full_url, timeout=20).content
            out_path.write_bytes(img_data)
            downloaded += 1
        except Exception as e:
            tqdm.write(f"⚠  {name}: download failed ({e})")

    tqdm.write(f"\n✔  Saved {downloaded} images in {OUT_DIR}/")

if __name__ == "__main__":
    main()
