import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ContactForm } from "@/components/ContactForm";

vi.mock("@/app/actions", () => ({
  createContact: vi.fn(),
  updateContact: vi.fn(),
}));

import { createContact } from "@/app/actions";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the entered values via createContact", async () => {
    vi.mocked(createContact).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/Name/), "Grace Hopper");
    await user.type(screen.getByLabelText(/Email/), "grace@navy.mil");
    await user.click(screen.getByRole("button", { name: "Add contact" }));

    await waitFor(() => {
      expect(createContact).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Grace Hopper",
          email: "grace@navy.mil",
        }),
      );
    });
  });

  it("shows field errors returned by the server action", async () => {
    vi.mocked(createContact).mockResolvedValue({
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { name: ["Name is required"] },
    });
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "Add contact" }));

    expect(
      await screen.findByText("Please fix the highlighted fields."),
    ).toBeInTheDocument();
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  it("calls onDone after a successful submit", async () => {
    vi.mocked(createContact).mockResolvedValue({ success: true });
    const onDone = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onDone={onDone} />);

    await user.type(screen.getByLabelText(/Name/), "Grace Hopper");
    await user.click(screen.getByRole("button", { name: "Add contact" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
