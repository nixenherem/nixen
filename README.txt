NIXEN DEMON LIST — STARTER PROTOTYPE

UPLOAD TO GITHUB
1. Open your nixen GitHub repository.
2. Replace your existing index.html with this index.html.
3. Add style.css and script.js in the same main folder.
4. Create a folder named images.
5. Upload screenshots into images.
6. Commit the changes. Cloudflare Pages should redeploy automatically.

EDITING LEVELS
Open script.js. The const levels = [...] section at the top is the only part you normally need to edit.

The order is your personal ranking:
first item = #1
second item = #2
etc.

Example:
{
  name: "Sky Shredder",
  creator: "Creator",
  globalRank: 181,
  attempts: "12,345",
  completed: "Aug 10, 2026",
  worstFail: "93%",
  enjoyment: "9/10",
  video: "https://youtube.com/...",
  image: "images/sky-shredder.jpg",
  note: "Optional note."
}

Later, globalRank can be replaced with an API lookup.
