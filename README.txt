NIXEN DEMON LIST — V3

WHAT CHANGED
------------
- Removed the search bar entirely.
- Sky Shredder now uses its Geometry Dash level ID: 88136707.
- Level names and AREDL positions are fetched automatically.
- The browser calls your own /api/aredl endpoint.
- A Cloudflare Pages Function proxies the AREDL API.
- The card currently shows only the level name in the center.
- Attempts, completion date, worst fail and video remain local stats.

IMPORTANT: NEW FOLDER
---------------------
This version has:

functions/
  api/
    aredl.js

You need to preserve that folder structure in GitHub.

Your repo should look like:

index.html
style.css
script.js
sky-shredder.jpg
functions/
  api/
    aredl.js

HOW THE AREDL LOOKUP WORKS
--------------------------
In script.js:

{
  levelId: 88136707,
  fallbackName: "Sky Shredder",
  ...
}

The site fetches AREDL's full level list once.

It finds the object where:

level_id === 88136707

and then uses that object's:

name
position

So if Sky Shredder moves from #181 to #182, the website can display
the new placement without you editing script.js.

WHY THERE IS A CLOUDFLARE FUNCTION
----------------------------------
The page fetches:

/api/aredl

instead of contacting api.aredl.net directly from the browser.

Cloudflare then contacts AREDL server-side. This makes the setup more
reliable if the AREDL API does not allow browser cross-origin requests.

ADMIN EDITOR (NEXT STEP)
------------------------
Do not make an "admin" button that is merely hidden with CSS/JavaScript.
Anyone could reveal it.

The proper setup will be:

/demonlist       public page
/admin           private editor

Cloudflare Access authenticates /admin.
Cloudflare D1 stores your completion data.
Pages Functions read/write the database.

Then you can add/edit:
- level ID
- attempts
- completion date
- worst fail
- YouTube URL
- image path
- note

The level name and AREDL position still come automatically from AREDL.
