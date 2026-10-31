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
