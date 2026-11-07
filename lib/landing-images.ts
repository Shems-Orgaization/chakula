// lib/landing-images.ts

import heroImg from "@/public/landing/biryani.jpeg";
// import howItWorksImg from "@/public/landing/how-it-works.jpg";
import pilauImg from "@/public/landing/pilau.jpeg";
import coconutRiceImg from "@/public/landing/Swahili Coconut Rice.jpg";
import nyamaChomaImg from "@/public/landing/nyama-choma.jpeg";
import fishStewImg from "@/public/landing/coconut-fish-stew.jpeg";
import mukimoBeefImg from "@/public/landing/mukimo-beef-stew.jpeg";
import chipsMayaiImg from "@/public/landing/chips.jpeg";
import biryaniImg from "@/public/landing/biryani.jpeg";
import chapatiNdenguImg from "@/public/landing/chapati-meat.jpg";

// If you don't have local auth images yet, we can fallback to the external URLs directly
const commons = (file: string, width: number) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=${width}`;

export const LANDING_IMAGES = {
  hero: heroImg,
  // how: howItWorksImg,

  pilau: pilauImg,
  coconutRice: coconutRiceImg,
  nyamaChoma: nyamaChomaImg,
  fishStew: fishStewImg,
  mukimoBeef: mukimoBeefImg,
  chips: chipsMayaiImg,
  biryani: biryaniImg,
  chapatiMeat: chapatiNdenguImg,

  // Old keys, simplified to just strings (URLs)
  cabbage: commons("Ugali and cabbage.jpg", 900),
  omena: commons("Omena & ugali.jpg", 900),
  fish: "/landing/ugali-fish.jpg", // Assume these exist in public/landing
  liver: "/landing/ugali-liver.jpg",
};

export const AUTH_IMAGES = {
  login: commons("Ugali and cabbage.jpg", 1400),
  signup: commons("Omena & ugali.jpg", 1400),
};