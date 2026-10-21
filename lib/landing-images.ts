// lib/landing-images.ts
// First source that loads wins. Put your own photo in public/landing/ or public/auth/ to override.
// Wikimedia Commons files are the fallback.
const commons = (file: string, width: number) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=${width}`;

const local = (name: string) => [`/landing/${name}.jpg`, `/landing/${name}.webp`];
const localAuth = (name: string) => [`/auth/${name}.jpg`, `/auth/${name}.webp`];

export const LANDING_IMAGES = {
  hero: [...local("hero"), commons("Ugali na Sukumawiki.JPG", 1920)],
  how: [...local("how-it-works"), commons("Ugali.jpg", 1200)],
  cabbage: [...local("ugali-cabbage"), commons("Ugali and cabbage.jpg", 900)],
  omena: [...local("ugali-omena"), commons("Omena & ugali.jpg", 900)],
  fish: [
    ...local("ugali-fish"),
    commons("Fried Tilapia, Ugali, Sukuma Wiki and Kachumbari (From Kisumu).JPG", 900),
  ],
  liver: [...local("ugali-liver"), commons("Ugali, Maini and Sukuma managu.jpg", 900)],
};

export const AUTH_IMAGES = {
  login: [...localAuth("login"), commons("Ugali and cabbage.jpg", 1400)],
  signup: [...localAuth("signup"), commons("Omena & ugali.jpg", 1400)],
};