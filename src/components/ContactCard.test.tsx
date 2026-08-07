import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ContactCard } from "@/components/ContactCard";
import type { Contact } from "@/types";

vi.mock("@/app/actions", () => ({
  deleteContact: vi.fn().mockResolvedValue({ success: true }),
  toggleFavorite: vi.fn().mockResolvedValue({ success: true }),
  createContact: vi.fn().mockResolvedValue({ success: true }),
  updateContact: vi.fn().mockResolvedValue({ success: true }),
}));

import { deleteContact, toggleFavorite } from "@/app/actions";

const baseContact: Contact = {
  id: "1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "555-0100",
  company: "Analytical Engines Ltd",
  notes: null,
  favorite: false,
  tags: [{ id: "t1", name: "mentor" }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("ContactCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders contact details and tags", () => {
    render(<ContactCard contact={baseContact} />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("mentor")).toBeInTheDocument();
  });

  it("calls toggleFavorite with the flipped value when clicked", async () => {
    const user = userEvent.setup();
    render(<ContactCard contact={baseContact} />);

    await user.click(screen.getByRole("button", { name: "Favorite" }));

    await waitFor(() => {
      expect(toggleFavorite).toHaveBeenCalledWith("1", true);
    });
  });

  it("asks for confirmation and calls deleteContact when confirmed", async () => {
    const user = userEvent.setup();
    render(<ContactCard contact={baseContact} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalledWith("Delete Ada Lovelace?");
    await waitFor(() => {
      expect(deleteContact).toHaveBeenCalledWith("1");
    });
  });

  it("does not delete when confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<ContactCard contact={baseContact} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteContact).not.toHaveBeenCalled();
  });

  it("switches to edit mode when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactCard contact={baseContact} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });
});
