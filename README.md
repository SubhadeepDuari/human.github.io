# Subhadeep — GitHub Pages Personal Archive

This version is designed specifically for **GitHub Pages**.

You do not need to edit the HTML every time you add something.

## Folder structure

```text
/
├── index.html
├── styles.css
├── app.js
├── .nojekyll
├── data/
│   ├── achievements.csv
│   ├── dj_sets.csv
│   └── movies.csv
└── images/
    ├── home/
    ├── achievements/
    └── movies/
```

---

# 1. HOME PHOTOS

Put homepage images inside:

```text
images/home/
```

Use this exact naming convention:

```text
home_01.jpg
home_02.jpg
home_03.jpg
...
home_12.jpg
```

Supported extensions:

```text
.jpg
.jpeg
.png
.webp
```

The JavaScript checks those extensions automatically.

If an image is missing, the website shows a clean blank PHOTO square instead.

The default site has 12 homepage photo slots.

To change the number of slots, open `app.js` and change:

```js
homeImageCount: 12
```

For example:

```js
homeImageCount: 20
```

Then you can add `home_13.jpg` through `home_20.jpg`.

---

# 2. ACHIEVEMENTS

Put achievement images inside:

```text
images/achievements/
```

Then edit:

```text
data/achievements.csv
```

Columns:

```text
order,year,title,place,category,image,description,link
```

Example:

```csv
1,2026,Best Poster Award,Conference Name,Award,best_poster.jpg,"Won for my research on ...",https://example.com
```

The `image` cell must exactly match the filename inside `images/achievements/`.

You can leave `link` blank.

When you add a new CSV row, the website automatically adds a new achievement card.

---

# 3. THE DECKS

Edit:

```text
data/dj_sets.csv
```

Columns:

```text
order,title,url,genre,duration,location,date
```

Example YouTube row:

```csv
1,My Berlin Set,https://www.youtube.com/watch?v=XXXXXXXXXXX,Techno,62 min,Berlin,2026
```

Example SoundCloud row:

```csv
2,Night Session,https://soundcloud.com/yourname/your-set,Hypnotic techno,71 min,New Delhi,2026
```

The site automatically detects:

- YouTube
- youtu.be
- SoundCloud

YouTube links become embedded YouTube players.

SoundCloud links become embedded SoundCloud players.

You do not need to change HTML or JavaScript.

If you only know the URL, the other fields can be left blank.

---

# 4. MOVIES

Put movie posters inside:

```text
images/movies/
```

Then edit:

```text
data/movies.csv
```

Columns:

```text
order,title,year,director,rating,poster,comment
```

Example:

```csv
1,Perfect Days,2023,Wim Wenders,4.5/5,perfect_days.jpg,"Quiet, precise and deeply humane."
```

The `poster` cell must exactly match the filename inside `images/movies/`.

When you add another CSV row, another film card appears automatically.

---

# 5. IMPORTANT CSV RULE

If your description/comment contains a comma, put the whole text inside double quotes.

Correct:

```csv
"Beautiful, quiet, and very personal."
```

If you need to use a double quote inside the text, double it:

```csv
"I called it ""beautiful"" after watching it."
```

---

# 6. TESTING LOCALLY

Because browsers block JavaScript from reading CSV files directly from `file://`,
double-clicking `index.html` may not load the CSV data.

From the project folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

This limitation does NOT apply when the website is hosted on GitHub Pages.

---

# 7. HOST ON GITHUB PAGES

Create a GitHub repository named:

```text
YOUR-GITHUB-USERNAME.github.io
```

Upload all the contents of this folder to the repository root.

Then go to:

```text
Repository → Settings → Pages
```

Choose deployment from the main branch/root if GitHub asks.

Your site will be available at:

```text
https://YOUR-GITHUB-USERNAME.github.io
```

---

# 8. YOUR NORMAL UPDATE WORKFLOW

## Add a homepage photo
1. Rename it `home_05.jpg`
2. Put it in `images/home/`
3. Commit/push to GitHub

## Add an achievement
1. Put the image in `images/achievements/`
2. Add one line to `data/achievements.csv`
3. Commit/push

## Add a DJ set
1. Add one line to `data/dj_sets.csv`
2. Paste SoundCloud or YouTube URL
3. Commit/push

## Add a movie
1. Put poster in `images/movies/`
2. Add one line to `data/movies.csv`
3. Commit/push

GitHub Pages rebuilds the public site automatically after the commit is published.


## Starter content included

This package already contains:

- a concise selected-achievements list distilled from the supplied CV,
- 8 initial YouTube entries in **The Decks**,
- 24 initial movie entries based on the supplied movie screenshots.

The movie poster files are local starter assets in `images/movies/`. Most are cropped
from the reference screenshots you supplied, so you can replace any one later simply
by overwriting the same filename with a cleaner poster image.

`American Beauty` uses a temporary local poster placeholder because only a small part
of that poster was unobstructed in the supplied screenshot.

Movie ratings and comments are intentionally blank so you can enter your own values
in `data/movies.csv`.
