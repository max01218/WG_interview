from PIL import Image
import os

image_dir = r"d:\side_project\aunt_game\next-app\public\images"
files = ["monster.png", "vampire.png", "mummy.png", "cat.png", "pumpkin.png"]

for filename in files:
    path = os.path.join(image_dir, filename)
    if os.path.exists(path):
        try:
            img = Image.open(path)
            width, height = img.size
            # Crop to top 50%
            cropped_img = img.crop((0, 0, width, int(height * 0.5)))
            cropped_img.save(path)
            print(f"Cropped {filename}")
        except Exception as e:
            print(f"Failed to crop {filename}: {e}")
    else:
        print(f"File not found: {filename}")
