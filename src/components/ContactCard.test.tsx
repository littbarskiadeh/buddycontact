import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ContactCard } from "@/components/ContactCard";
import { ToastProvider } from "@/components/Toast";
import type { Contact } from "@/types";

vi.mock("@/app/actions", () => ({
  deleteContact: vi.fn().mockResolvedValue({ success: true }),
  toggleFavorite: vi.fn().mockResolvedValue({ success: true }),
  logInteraction: vi.fn().mockResolvedValue({ success: true }),
  snoozeContact: vi.fn().mockResolvedValue({ success: true }),
  unsnoozeContact: vi.fn().mockResolvedValue({ success: true }),
  createContact: vi.fn().mockResolvedValue({ success: true }),
  updateContact: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/app/ai-actions", () => ({
  getTopicBubble: vi
    .fn()
    .mockResolvedValue({ success: false, error: "No API key configured." }),
}));

import {
  deleteContact,
  logInteraction,
  snoozeContact,
  toggleFavorite,
} from "@/app/actions";

const baseContact: Contact = {
  id: "1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "555-0100",
  company: "Analytical Engines Ltd",
  favorite: false,
  cadenceDays: 14,
  lastContactedAt: new Date().toISOString(),
  snoozedUntil: null,
  suggestedTopic: null,
  lastInteraction: null,
  tags: [{ id: "t1", name: "mentor" }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderCard(contact: Contact = baseContact) {
  return render(
    <ToastProvider>
      <ContactCard contact={contact} />
    </ToastProvider>,
  );
}

describe("ContactCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the contact's name", () => {
    renderCard();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("opens an interactive composer instead of logging immediately when Log Contact is clicked", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "Log Contact" }));

    expect(logInteraction).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText("What did you talk about? (optional)"),
    ).toBeInTheDocument();
  });

  it("logs the interaction with the entered note and channel on submit", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "Log Contact" }));
    await user.type(
      screen.getByLabelText("What did you talk about? (optional)"),
      "Caught up over coffee",
    );
    await user.click(screen.getByRole("button", { name: "Call" }));
    await user.click(screen.getByRole("button", { name: "Log Contact" }));

    await waitFor(() => {
      expect(logInteraction).toHaveBeenCalledWith(
        "1",
        "Caught up over coffee",
        "call",
      );
    });
  });

  it("closes the composer without logging when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "Log Contact" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(logInteraction).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Log Contact" }),
    ).toBeInTheDocument();
  });

  it("calls toggleFavorite with the flipped value when clicked via the overflow menu", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Favorite" }));

    await waitFor(() => {
      expect(toggleFavorite).toHaveBeenCalledWith("1", true);
    });
  });

  it("requires a confirm click before deleting, via the overflow menu", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(deleteContact).not.toHaveBeenCalled();

    expect(screen.getByText(/Delete Ada Lovelace\?/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(deleteContact).toHaveBeenCalledWith("1");
    });
  });

  it("does not delete when the delete confirmation is cancelled", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(deleteContact).not.toHaveBeenCalled();
    expect(screen.queryByText(/Delete Ada Lovelace\?/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "More actions" }),
    ).toBeInTheDocument();
  });

  it("snoozes the contact for the selected preset via the overflow menu", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Snooze 1 week" }));

    await waitFor(() => {
      expect(snoozeContact).toHaveBeenCalledWith("1", 7);
    });
  });

  it("does not show snooze options when the contact has no reminder cadence", async () => {
    const user = userEvent.setup();
    renderCard({ ...baseContact, cadenceDays: null });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    expect(
      screen.queryByRole("menuitem", { name: /Snooze/ }),
    ).not.toBeInTheDocument();
  });

  it("switches to edit mode when Edit is clicked via the overflow menu", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeInTheDocument();
  });
});
