export const INTERACTION_CHANNELS = [
  "call",
  "text",
  "email",
  "chat",
  "social",
  "in_person",
  "other",
] as const;

export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number];

export const CHANNEL_LABELS: Record<InteractionChannel, string> = {
  call: "Call",
  text: "Text",
  email: "Email",
  chat: "Chat / DM",
  social: "Social media",
  in_person: "In person",
  other: "Other",
};
