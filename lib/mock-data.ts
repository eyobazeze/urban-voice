import type { Comment, Report } from "./types";

const ago = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();

// Placeholder data so the UI runs before Supabase is connected.
// The signed-in citizen in demo mode. With Supabase this becomes auth.uid().
export const DEMO_USER = { name: "Selam Tadesse", handle: "selam_t" };

const rawReports = (): Omit<Report, "mine">[] => [
  {
    id: "r1", category: "roads", status: "in_progress",
    title: "Deep pothole outside the Bole Medhanialem church gate",
    body: "Taxis swerve into the opposite lane to avoid it. Two motorbikes have gone down this week.",
    address: "Bole Medhanialem, Bole", lat: 8.9969, lng: 38.7867,
    author: { name: "Selam Tadesse", handle: "selam_t" },
    createdAt: ago(2), likes: 128, comments: 24, shares: 9,
  },
  {
    id: "r2", category: "lighting", status: "submitted",
    title: "Five streetlights out along Kazanchis walkway",
    body: "The stretch between the Nile Hotel and the underpass has been dark for over a week. Women are avoiding it after 7pm.",
    address: "Kazanchis, Kirkos", lat: 9.0163, lng: 38.7694,
    author: { name: "Dawit Alemu", handle: "dawit.a" },
    createdAt: ago(5), likes: 86, comments: 17, shares: 12,
  },
  {
    id: "r3", category: "waste", status: "in_review",
    title: "Uncollected waste piling up near Merkato bus terminal",
    body: "Collection hasn't come in nine days. The smell is reaching the shops across the road.",
    address: "Merkato, Addis Ketema", lat: 9.0305, lng: 38.7352,
    author: { name: "Hana Girma", handle: "hana.g" },
    createdAt: ago(9), likes: 214, comments: 41, shares: 33,
  },
  {
    id: "r4", category: "transport", status: "submitted",
    title: "Bus stop shelter collapsed at Megenagna interchange",
    body: "The roof panel fell onto the bench. Commuters are now queuing in the road.",
    address: "Megenagna, Yeka", lat: 9.0204, lng: 38.8012,
    author: { name: "Yonas Bekele", handle: "yonasb" },
    createdAt: ago(14), likes: 59, comments: 8, shares: 4,
  },
  {
    id: "r5", category: "parks", status: "resolved",
    title: "Broken swings and glass in the Arat Kilo playground",
    body: "Cleared and repaired by the sub-city this morning. Thank you to everyone who shared this.",
    address: "Arat Kilo, Arada", lat: 9.0342, lng: 38.7629,
    author: { name: "Meron Haile", handle: "meron_h" },
    createdAt: ago(30), likes: 342, comments: 56, shares: 71,
  },
  {
    id: "r6", category: "safety", status: "in_review",
    title: "Open manhole without a cover near Mexico Square",
    body: "Someone has placed a branch in it as a warning. It is right where people step off the minibus.",
    address: "Mexico Square, Lideta", lat: 9.0108, lng: 38.7428,
    author: { name: "Abel Mulugeta", handle: "abel.m" },
    createdAt: ago(3), likes: 177, comments: 29, shares: 38,
  },
  {
    id: "r7", category: "roads", status: "submitted",
    title: "Flooding at the Sar Bet junction after every rain",
    body: "Drain is blocked with silt. Water reaches the pavement within ten minutes of rain.",
    address: "Sar Bet, Kirkos", lat: 8.9957, lng: 38.7506,
    author: { name: "Rahel Worku", handle: "rahelw" },
    createdAt: ago(48), likes: 64, comments: 11, shares: 6,
  },
  {
    id: "r8", category: "lighting", status: "in_progress",
    title: "Traffic signal stuck on red at Piassa roundabout",
    body: "Traffic police are directing by hand but the queue goes back to Churchill Avenue.",
    address: "Piassa, Arada", lat: 9.0353, lng: 38.7503,
    author: { name: "Biruk Tsegaye", handle: "biruk_t" },
    createdAt: ago(1), likes: 95, comments: 14, shares: 7,
  },
  {
    id: "r9", category: "roads", status: "in_review",
    title: "Burst water pipe flooding the road near Edna Mall",
    body: "Water has been running onto the road since yesterday afternoon. The lane is already breaking up.",
    address: "Bole Road, Bole", lat: 8.9988, lng: 38.7835,
    author: { name: "Selam Tadesse", handle: "selam_t" },
    createdAt: ago(26), likes: 41, comments: 6, shares: 3,
  },
  {
    id: "r10", category: "transport", status: "submitted",
    title: "Bus stop sign missing on the Bole to Airport route",
    body: "The pole is still there but the sign was removed. Passengers cannot tell which routes stop here.",
    address: "Bole Airport Road, Bole", lat: 8.9895, lng: 38.7990,
    author: { name: "Selam Tadesse", handle: "selam_t" },
    createdAt: ago(0.5), likes: 7, comments: 1, shares: 0,
  },
];

export const getMockReports = (): Report[] =>
  rawReports().map((r) => ({ ...r, mine: r.author.handle === DEMO_USER.handle }));

// Addis Ababa city centre
export const ADDIS_CENTER: [number, number] = [9.0192, 38.7525];

const COMMENT_SEEDS: Record<string, [string, string, string, number][]> = {
  r1: [
    ["Liya Mengistu", "liya_m", "Passed here this morning, it is bigger than it looks. Please fix before the rains.", 1],
    ["Kidus Alemayehu", "kidus_a", "Reported the same one last month. Glad it is finally in progress.", 1.5],
  ],
  r2: [["Tigist Ayele", "tigist.a", "Confirming. I walk this route daily and it is pitch black after 6pm.", 3]],
  r3: [
    ["Samuel Desta", "samd", "The smell reaches the whole block now. Needs urgent collection.", 6],
    ["Betty Kassa", "betty_k", "Shared with the woreda office as well.", 5],
    ["Henok Abate", "henok.a", "Any update from the sub-city on a collection date?", 2],
  ],
  r5: [["Selam Tadesse", "selam_t", "Went by this afternoon and the swings are back. Thank you!", 20]],
  r6: [["Mulu Bekele", "mulu_b", "Someone put a chair over it for now, but it needs a proper cover.", 2]],
};

export const getMockComments = (reportId: string): Comment[] =>
  (COMMENT_SEEDS[reportId] ?? []).map(([name, handle, body, hours], i) => ({
    id: `${reportId}-c${i}`,
    author: { name, handle },
    body,
    createdAt: ago(hours),
  }));
