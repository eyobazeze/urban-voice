import type { CategoryId, Comment, Report, ReportStatus } from "./types";

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

const HOUR = 3600_000;
const STAFF_NAMES = ["Alemu Kebede", "Dawit Tadesse", "Ruth Alem", "Samuel Mola"];

// Who is working on the hand-written sample reports above
const ASSIGNED: Record<string, string> = { r1: "Alemu Kebede", r3: "Samuel Mola", r5: "Ruth Alem", r6: "Ruth Alem", r8: "Dawit Tadesse" };
const RESOLVED_AFTER_HOURS: Record<string, number> = { r5: 22 };

const AREAS = [
  { name: "Bole", spot: "Bole Medhanialem", lat: 8.9969, lng: 38.7867 },
  { name: "Kirkos", spot: "Kazanchis Junction", lat: 9.0163, lng: 38.7694 },
  { name: "Yeka", spot: "Megenagna", lat: 9.0204, lng: 38.8012 },
  { name: "Arada", spot: "Piassa", lat: 9.0353, lng: 38.7503 },
  { name: "Addis Ketema", spot: "Merkato Terminal", lat: 9.0305, lng: 38.7352 },
  { name: "Lideta", spot: "Mexico Square", lat: 9.0108, lng: 38.7428 },
  { name: "Nifas Silk-Lafto", spot: "Sar Bet", lat: 8.9957, lng: 38.7506 },
  { name: "Kolfe Keranio", spot: "Kolfe Junction", lat: 9.0152, lng: 38.7075 },
  { name: "Gulele", spot: "Gulele Market", lat: 9.0482, lng: 38.7479 },
  { name: "Akaki Kality", spot: "Kality Roundabout", lat: 8.9502, lng: 38.7601 },
];
const TITLES: Record<CategoryId, string[]> = {
  roads: ["Pothole damaging cars at", "Road surface collapsing near", "Blocked drain flooding the road at"],
  lighting: ["Streetlights out along", "Dark stretch with broken lamps at", "Faulty traffic signal at"],
  waste: ["Overflowing bins at", "Uncollected rubbish near", "Illegal dumping beside"],
  transport: ["Damaged bus shelter at", "Missing route sign at", "Minibus queue blocking the road at"],
  parks: ["Broken benches in", "Overgrown grass and litter at", "Damaged playground near"],
  safety: ["Open manhole near", "Exposed cables beside", "Unsafe crossing at"],
};
const CATEGORY_IDS = Object.keys(TITLES) as CategoryId[];
const NEIGHBOURS = ["Tigist Ayele", "Samuel Desta", "Betty Kassa", "Henok Abate", "Liya Mengistu", "Kidus Alemayehu", "Mulu Bekele", "Rediet Tesfaye", "Nahom Girma", "Saron Wolde"];

// Twelve weeks of older reports so the staff dashboards have something to chart.
// Generated from a fixed seed, so the numbers are the same every time.
function olderReports(): Omit<Report, "mine">[] {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)];
  const out: Omit<Report, "mine">[] = [];
  for (let i = 1; i <= 38; i++) {
    const category = pick(CATEGORY_IDS);
    const area = pick(AREAS);
    const daysAgo = 4 + rnd() * 80;
    const resolves = rnd() < (daysAgo > 14 ? 0.9 : 0.4);
    const takes = Math.min(daysAgo * 0.7, 1 + rnd() * 13 + (category === "roads" ? 4 : 0));
    const status: ReportStatus = resolves ? "resolved" : pick<ReportStatus>(daysAgo > 10 ? ["in_progress", "in_progress", "in_review"] : ["submitted", "in_review", "in_progress"]);
    const name = pick(NEIGHBOURS);
    const createdAt = new Date(Date.now() - daysAgo * 24 * HOUR).toISOString();
    out.push({
      id: `h${i}`, category, status,
      title: `${pick(TITLES[category])} ${area.spot}`,
      body: "Reported by a resident. Please send a crew to take a look.",
      address: `${area.spot}, ${area.name}`,
      lat: area.lat + (rnd() - 0.5) * 0.012, lng: area.lng + (rnd() - 0.5) * 0.012,
      author: { name, handle: name.toLowerCase().replace(/\s+/g, ".") },
      createdAt,
      resolvedAt: resolves ? new Date(Date.now() - (daysAgo - takes) * 24 * HOUR).toISOString() : undefined,
      assignee: status === "submitted" ? undefined : pick(STAFF_NAMES),
      likes: 3 + Math.floor(rnd() * 90), comments: Math.floor(rnd() * 14), shares: Math.floor(rnd() * 10),
    });
  }
  return out;
}

export const getMockReports = (): Report[] =>
  [...rawReports(), ...olderReports()].map((r) => {
    const created = +new Date(r.createdAt);
    return {
      ...r,
      mine: r.author.handle === DEMO_USER.handle,
      assignee: r.assignee ?? ASSIGNED[r.id],
      resolvedAt: r.resolvedAt ?? (RESOLVED_AFTER_HOURS[r.id] ? new Date(created + RESOLVED_AFTER_HOURS[r.id] * HOUR).toISOString() : undefined),
    };
  });

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
