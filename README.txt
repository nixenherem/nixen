NIXEN DEMON LIST — V4

WHAT CHANGED
------------
- Level rectangles are about 1.5x taller.
  Desktop: 162px.
  Mobile: 144px.
- The public list is now database-backed.
- Added /admin for editing your completions.
- Added password-protected admin sessions.
- Added add/edit/delete/reorder controls.
- AREDL still supplies live level names and positions.
- Sky Shredder uses sky-shredder.png.

IMPORTANT
---------
The admin panel will NOT work until you do the Cloudflare setup below.

1. UPLOAD THE FILES
-------------------
Upload everything in this ZIP to your GitHub repo while keeping the folders.

Important folders:

admin/
functions/
functions/_lib/
functions/admin/
functions/api/
functions/api/admin/

2. CREATE A D1 DATABASE
-----------------------
Cloudflare dashboard:
Workers & Pages > D1 SQL Database > Create

Suggested name:
nixen-demonlist

Open the database's SQL console and run everything in schema.sql.

The schema also adds Sky Shredder as the first completion.

3. BIND D1 TO YOUR PAGES PROJECT
--------------------------------
Cloudflare dashboard:
Workers & Pages > nixen > Settings > Bindings

Add a D1 database binding.

Variable / binding name MUST be:

DB

Choose the nixen-demonlist database.

Do this for Production.
If Cloudflare shows a separate Preview binding option, add DB there too
if you want preview deployments to work.

4. CREATE YOUR ADMIN SECRETS
----------------------------
Cloudflare dashboard:
Workers & Pages > nixen > Settings > Variables and Secrets

Add these as encrypted secrets:

ADMIN_PASSWORD
ADMIN_SESSION_SECRET

ADMIN_PASSWORD:
Choose the password you want to use at /admin-login.

ADMIN_SESSION_SECRET:
Use a long random value. It is NOT your login password.
Example format only:
a-long-random-private-string-with-many-characters

Do not put either secret in GitHub.

5. DEPLOY
---------
After GitHub deploys the updated project:

Public list:
https://nixen.pages.dev/

Login:
https://nixen.pages.dev/admin-login

Editor:
https://nixen.pages.dev/admin/

There is intentionally no public admin button.

6. SCREENSHOTS
--------------
For now, screenshots still live in your GitHub repo.

Example:
sky-shredder.png

Then the Image field in /admin should be:

sky-shredder.png

You can also enter a full image URL.

A later version can use Cloudflare R2 so you can upload screenshots
directly from /admin too.

ADMIN CAN EDIT
--------------
- Level ID
- Attempts
- Completion date/text
- Worst fail
- Video URL
- Image filename or image URL
- Note
- List order

The AREDL name and position are automatic and are not stored manually.
