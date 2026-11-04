export type CategoryId = "roads" | "lighting" | "waste" | "transport" | "parks" | "safety";
export type ReportStatus = "submitted" | "in_review" | "in_progress" | "resolved";

export interface Author {
  name: string;
  handle: string;
  avatarUrl?: string;
}

export interface Report {
  id: string;
  title: string;
  body: string;
  category: CategoryId;
  status: ReportStatus;
  lat: number;
  lng: number;
  address: string;
  photoUrls?: string[];
  author: Author;
  createdAt: string; // ISO
  mine: boolean; // reported by the signed-in user
  likedByMe?: boolean; // the signed-in user has liked it
  resolvedAt?: string; // ISO, when the city closed it
  assigneeId?: string; // staff member working on it
  assignee?: string;   // that staff member's name
  likes: number;
  comments: number;
  shares: number;
}

export interface Comment {
  id: string;
  author: Author;
  body: string;
  createdAt: string; // ISO
  mine?: boolean; // written by the signed-in user
}

export interface HistoryEntry {
  id: string;
  status: ReportStatus; // the status the report moved to
  note?: string;
  by?: string; // staff name (shown to staff only)
  createdAt: string; // ISO
}
