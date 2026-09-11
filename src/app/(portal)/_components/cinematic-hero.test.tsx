import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "sonner";
import { CinematicHero } from "./cinematic-hero";

vi.mock("@/shared/lib/i18n/client", () => ({
  useT: () => (key: string) => key,
  useLocale: () => "th",
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CinematicHero (Mainframe Full-Screen Landing Hero with 3D Monk & Video Scrub)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Mainframe logo, navbar links, and CTA", () => {
    const { container } = render(<CinematicHero />);

    // Logo & asterisk
    expect(screen.getByText("Mainframe®")).toBeTruthy();
    expect(container.textContent).toContain("Mainframe®");
    expect(container.textContent).toContain("✱");

    // Desktop nav links
    expect(screen.getAllByText("Labs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Studio").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Openings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Shop").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Get in touch").length).toBeGreaterThan(0);
  });

  it("renders blurred intro label and action pill buttons", () => {
    render(<CinematicHero />);

    // Blurred label
    expect(screen.getByText(/Hey there, meet/i)).toBeTruthy();

    // Action pill buttons
    expect(screen.getByText("Pitch us an idea")).toBeTruthy();
    expect(screen.getByText("Come work here")).toBeTruthy();
    expect(screen.getByText("Send a brief hello")).toBeTruthy();
    expect(screen.getByText("See how we operate")).toBeTruthy();
    expect(screen.getByText(/hello@mainframe.co/i)).toBeTruthy();
  });

  it("copies email to clipboard on pill click and displays toast", () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<CinematicHero />);
    const emailBtn = screen.getByText(/hello@mainframe.co/i).closest("button");
    expect(emailBtn).toBeTruthy();

    fireEvent.click(emailBtn!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello@mainframe.co");
    expect(toast.success).toHaveBeenCalledWith("Copied hello@mainframe.co to clipboard!");
  });

  it("toggles character mode between 3D Monk and Mainframe A.R.I.A", () => {
    render(<CinematicHero />);

    const monkBtn = screen.getByText("🙏 พระธรรมทูต 3D");
    const mainframeBtn = screen.getByText("🤖 Mainframe A.R.I.A");

    expect(monkBtn).toBeTruthy();
    expect(mainframeBtn).toBeTruthy();

    // Switch to Mainframe original
    fireEvent.click(mainframeBtn);
    expect(screen.getByText(/Mainframe's Adaptive Response Interface Agent/i)).toBeTruthy();

    // Switch back to 3D Monk
    fireEvent.click(monkBtn);
    expect(screen.getByText(/Dhammaduta's Mindful 3D Cursor Tracking Agent/i)).toBeTruthy();
  });

  it("toggles mobile hamburger navigation menu", () => {
    render(<CinematicHero />);

    const menuBtn = screen.getByLabelText("Open menu");
    expect(menuBtn).toBeTruthy();

    fireEvent.click(menuBtn);
    expect(screen.getByLabelText("Close menu")).toBeTruthy();
  });
});
