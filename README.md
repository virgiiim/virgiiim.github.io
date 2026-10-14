# virgiiim.github.io

Personal academic website of Virginia Morini. Plain HTML/CSS/JS, so there's no build step and no Jekyll.

## Publish on GitHub Pages

1. Create a **public** repository named exactly `virgiiim.github.io` on GitHub.
2. Upload all the files in this folder (keep the folder structure), or:
   ```bash
   git init && git add . && git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/virgiiim/virgiiim.github.io.git
   git push -u origin main
   ```
3. Go to **Settings → Pages**, set *Source: Deploy from a branch*, *Branch: main / (root)*.
4. After a minute the site is live at **https://virgiiim.github.io**.

## Updating content

| What | Where |
|---|---|
| News, publications, research themes | `assets/js/data.js` (one object per item) |
| Bio, timeline, projects, events & talks, contact (Teaching is in the file but commented out) | `index.html` (each section is commented) |
| Colours and fonts | top of `assets/css/style.css` (`:root` variables) |
| Photo | `assets/img/virginia.jpg` |

To add a paper, copy an object in `PUBLICATIONS` and edit it. The `themes` keys
(`mh`, `polar`, `recsys`, `abm`, `rai`) control the filters, the counts and the header network.

## To do

- Optionally add an English CV as `assets/cv.pdf` and link it in the hero.
