import {
  AtSign,
  MessageSquare,
  Phone,
  Mail,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { InteractionChannel } from "@/lib/channels";

export const CHANNEL_ICONS: Record<InteractionChannel, LucideIcon> = {
  call: Phone,
  text: MessageSquare,
  email: Mail,
  chat: MessageSquare,
  social: AtSign,
  in_person: Users,
  other: MoreHorizontal,
};
