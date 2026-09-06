===== npm install (chat-prototype/, clean) =====
$ npm install
added 68 packages in 4s
npm warn install-scripts 2 packages had install scripts blocked because they are not covered by allowScripts:
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts   fsevents@2.3.3 (install: node-gyp rebuild)
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
EXIT:0

===== npm run build (tsc + vite) =====
$ npm run build
npm notice run chat-prototype@1.0.0 build
npm notice run tsc -p tsconfig.json && vite build
vite v5.4.21 building for production...
transforming...
✓ 40 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.43 kB │ gzip:  0.30 kB
dist/assets/index-8Wx6gRn_.css   19.95 kB │ gzip:  4.22 kB
dist/assets/index-DhEUt5WJ.js   186.19 kB │ gzip: 58.30 kB
✓ built in 411ms
EXIT:0 (tsc clean, no type errors)

===== node ./check.mjs (boot-seam + README + no-specimen guard) =====
$ node ./check.mjs
CHECK OK: dist bundle reference present
CHECK OK: boot seams, README commands, component seams, no-specimen guard all pass
{"package":"chat-prototype"}
EXIT:0

===== vite preview boot check :4174 (production build) =====
$ vite preview --port 4174 --strictPort --host 127.0.0.1
VITE ready: Local: http://127.0.0.1:4174/
$ curl http://127.0.0.1:4174/
HTTP 200 430B (index.html with bundle + css references)
bundle: /assets/index-DhEUt5WJ.js -> bundle HTTP 200 186339B
css: /assets/index-8Wx6gRn_.css -> css HTTP 200 19950B
default HTTP 200 / empty HTTP 200 / streaming HTTP 200 / failed HTTP 200 / long HTTP 200 / narrow HTTP 200

===== vite dev boot check :5173 =====
$ vite --port 5173 --strictPort --host 127.0.0.1
VITE v5.4.21 ready in 131 ms / Local: http://127.0.0.1:5173/
$ curl http://127.0.0.1:5173/
DEV HTTP 200 587B (references /src/main.tsx)

===== bundle content assertions (dist JS + CSS) =====
PASS — spine landmark (Session progress)
PASS — 5 tool kinds (Write/Read/Edit/Bash/WebSearch)
PASS — retry+dismiss (attempt + wont-fix)
PASS — cite-back (Attachment)
PASS — empty-trace (No tools ran this turn)
PASS — composer modes (Message composer)
PASS — tabs (Browser/Files/GitHub)
PASS — live regions (Turn status)
PASS — 30-turn (batch-)
PASS — breakpoints (1180px/820px/480px in CSS)
PASS — reduced-motion (prefers-reduced-motion in CSS)
PASS — tokens (#F5F2EC/#14522A/#8C1D17 in CSS)
CSS braces balanced 234/234

===== coordinator verification of synced prototype (Run folder) =====
$ npm install --no-audit --no-fund (in .chromarelay/runs/create-20260906-issue20-chat/prototype/chat-prototype/)
EXIT:0 (deps installed)
$ npm run build
EXIT:0 — tsc clean, vite built 40 modules (index-DhEUt5WJ.js 186.19 kB, index-8Wx6gRn_.css 19.95 kB)
$ vite preview :4179 (hub-managed) + curl
preview HTTP 200 (index.html with bundle + css references)
state=default 200 / state=empty 200 / state=streaming 200 / state=failed 200 / state=long 200 / state=narrow 200
bundle assertions (served JS): PASS Session progress / WebSearch / Turn status / Attachment / No tools ran this turn / Message composer
CSS assertions (src/styles.css): 8 breakpoint refs incl. 1180px/820px/480px; 1 prefers-reduced-motion block
