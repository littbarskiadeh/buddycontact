import type { InteractionChannel } from "@/lib/channels";

export type Tag = {
  id: string;
  name: string;
};

export type Interaction = {
  id: string;
  contactId: string;
  note: string | null;
  channel: InteractionChannel | null;
  occurredAt: string;
  createdAt: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  favorite: boolean;
  cadenceDays: number | null;
  lastContactedAt: string | null;
  snoozedUntil: string | null;
  suggestedTopic: string | null;
  /** Most recent interaction, for the inbox-style "last message" preview. */
  lastInteraction: {
    note: string | null;
    channel: InteractionChannel | null;
  } | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
};

export type ContactWithInteractions = Contact & {
  interactions: Interaction[];
};

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  favorite: boolean;
  tags: string;
  cadenceDays: string;
};
