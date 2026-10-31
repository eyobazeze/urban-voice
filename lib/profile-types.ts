export interface Settings {
  notifyStatus: boolean;   // the city changes the status of one of my reports
  notifyComments: boolean; // someone comments on one of my reports
  notifyDigest: boolean;   // weekly summary of what is happening nearby
}

export const DEFAULT_SETTINGS: Settings = { notifyStatus: true, notifyComments: true, notifyDigest: false };

export interface Profile {
  name: string;
  handle: string;
  email: string;
  memberSince: string; // ISO
  settings: Settings;
  demo: boolean;
}

export function mergeSettings(raw: unknown): Settings {
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<Settings>;
  return {
    notifyStatus: o.notifyStatus ?? DEFAULT_SETTINGS.notifyStatus,
    notifyComments: o.notifyComments ?? DEFAULT_SETTINGS.notifyComments,
    notifyDigest: o.notifyDigest ?? DEFAULT_SETTINGS.notifyDigest,
  };
}

export const HANDLE_PATTERN = /^[a-z0-9_.]{3,20}$/;
