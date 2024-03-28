export const channels = [
    { id: "ethereum", label: "Ethereum", sources: ["ethereum"] },
    { id: "farcaster", label: "Farcaster", sources: ["farcaster"] },
    { id: "business", label: "Business", sources: ["business"] },
    { id: "design", label: "Design", sources: ["design", "art" ] },
    { id: "networkStates", label: "Network States", sources: ["network-states"] },
    { id: "geopolitics", label: "Geopolitics", sources: ["geopolitics", "politics", "usa"] },
    { id: "bounties", label: "Bounties", sources: ["bounties"] },
    { id: "sports", label: "Sports", sources: ["sports", "esports"] },
    { id: "food", label: "Food", sources: ["food"] },
    { id: "games", label: "Games", sources: ["games"] },
    { id: "technology", label: "Technology", sources: ["technology", "dev"] },
];

export const symbols = ['ETH', 'BTC', 'SOL'];

export const SUPABASE_IMAGE_URL = 'https://fthzoepekxipizxebefk.supabase.co/storage/v1/object/public/cover_photos'

export const defaultUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000/" : process.env.VERCEL_URL
? "https://citizentimes.xyz/" : "";


    // const channelIds = [
    //     "ethereum",
    //     "farcaster",
    //     "business",
    //     "design",
    //     "networkStates",
    //     "geopolitics",
    //     "bounties",
    //     "sports",
    //     "food",
    //     "games",
    //     "technology",
    // ];
