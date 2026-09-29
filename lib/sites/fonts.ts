import {
  Atkinson_Hyperlegible,
  Big_Shoulders,
  Bricolage_Grotesque,
  Figtree,
  Instrument_Sans,
  Young_Serif,
} from "next/font/google";

// Only the faces a site actually uses get downloaded, so declaring every pairing here is cheap.
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  preload: false,
  adjustFontFallback: false,
});
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", preload: false });
const youngSerif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young-serif", preload: false });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", preload: false });
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  preload: false,
});

export const siteFontVariables = [bigShoulders, figtree, youngSerif, instrumentSans, bricolage, atkinson]
  .map((font) => font.variable)
  .join(" ");
