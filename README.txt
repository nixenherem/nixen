NIXEN DEMON LIST — V2

CHANGES IN THIS VERSION
-----------------------
- Removed all title / intro / stats text from the top.
- Changed font to Montserrat.
- Removed heavy/bold font weights.
- Removed the enjoyment category.
- Removed the page gradients and decorative glows.
- Changed the page background to a plain solid dark color.
- Simplified the image setup: screenshots can sit directly in the repo root.

UPLOAD THESE FILES TO YOUR GITHUB REPO
--------------------------------------
index.html
style.css
script.js

You do NOT need to make an images folder yet.

ADDING A SCREENSHOT
-------------------
Say you want Sky Shredder to use:

sky-shredder.jpg

Upload that JPG directly to the same place as:

index.html
style.css
script.js

Then script.js should contain:

image: "sky-shredder.jpg"

Later, if the site grows, moving screenshots into an /images folder is easy.

EDITING LEVELS
--------------
Open script.js and edit the objects inside:

const levels = [
  ...
];

The order controls your personal rank on the left.

globalRank controls the number on the right for now.
Later we can connect that to an API.
