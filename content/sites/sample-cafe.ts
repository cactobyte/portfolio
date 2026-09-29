import type { SiteConfig } from "@/lib/sites/types";

// Fictional café used to develop and show the template. Not a real business.
export const sampleCafe: SiteConfig = {
  slug: "sample-cafe",
  status: "sample",
  primaryAction: "whatsapp",
  business: {
    name: "Tile & Kettle",
    nameZh: "瓷壺咖啡",
    tagline: "Coffee, brunch and egg tarts under the old tiles of Sham Shui Po.",
    summary:
      "Neighbourhood café in Sham Shui Po serving hand-drip coffee, all-day brunch and Hong Kong-style bakes.",
    address: {
      line: "G/F, 12 Example Street",
      lineZh: "深水埗範例街12號地下",
      district: "Sham Shui Po, Kowloon",
      mapQuery: "Sham Shui Po, Hong Kong",
    },
    phone: "85200000000",
    whatsapp: "85200000000",
    email: "hello@example.com",
    instagram: "example",
    hours: [
      { days: [1, 2, 3, 4, 5], open: "09:30", close: "18:30" },
      { days: [6, 0], open: "09:00", close: "19:00" },
    ],
  },
  theme: {
    type: "signage",
    palette: {
      paper: "#E4EEE8",
      surface: "#F3F8F5",
      ink: "#12281F",
      muted: "#4F6259",
      accent: "#D9352C",
      onAccent: "#FFF6EE",
    },
  },
  sections: [
    {
      type: "priceList",
      id: "menu",
      title: "Menu",
      intro: "Everything is made in the shop each morning. Ask about oat milk and today's bakes.",
      groups: [
        {
          title: "Coffee",
          items: [
            { name: "Espresso", nameZh: "特濃咖啡", price: 32 },
            { name: "Flat white", nameZh: "白咖啡", price: 42 },
            { name: "Hand drip", nameZh: "手沖咖啡", price: 58, description: "Single origin, changes weekly." },
            { name: "Yuenyeung latte", nameZh: "鴛鴦咖啡", price: 45, description: "Espresso with Ceylon milk tea." },
          ],
        },
        {
          title: "Brunch",
          items: [
            {
              name: "Mentaiko spaghetti",
              nameZh: "明太子意粉",
              price: 98,
              description: "Onsen egg, nori, spring onion.",
            },
            { name: "Big breakfast", nameZh: "全日早餐", price: 118, description: "Sausage, eggs, toast, salad." },
            { name: "Salmon bagel", nameZh: "煙三文魚貝果", price: 88, description: "Smoked salmon, avocado, dill." },
          ],
        },
        {
          title: "Bakes",
          items: [
            { name: "Egg tart", nameZh: "蛋撻", price: 16 },
            { name: "Pineapple bun with butter", nameZh: "菠蘿油", price: 22 },
            { name: "Tofu cheesecake", nameZh: "豆腐芝士蛋糕", price: 48 },
          ],
        },
      ],
    },
    {
      type: "story",
      id: "about",
      title: "About us",
      paragraphs: [
        "We opened in a 1960s shopfront on a street of fabric wholesalers, and kept the green mosaic walls we found behind the plasterboard.",
        "The coffee is roasted in small batches in Kwun Tong. The egg tarts come out of the oven at 11 and 3.",
      ],
    },
    { type: "visit", id: "visit", title: "Visit" },
  ],
};
