import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("CinematicHero (Split-Screen Static Background & Transparent Monk Gaze)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders NEW DHARMA ERA headline, monk visual controls, and Dhammaduta marquee", () => {
    render(<CinematicHero />);

    // Check heading
    expect(screen.getByRole("heading", { name: /NEW DHARMA/i })).toBeTruthy();

    // Check switcher controls
    expect(screen.getByText("DHAMMADUTA BLUE // ธรรมทูตโมเดล")).toBeTruthy();
    expect(screen.getByText("พระสงฆ์ไทย (ไดคัทมองตามเมาส์)")).toBeTruthy();
    expect(screen.getByText("สมาธิบงกช (หันมองซ้าย)")).toBeTruthy();
    expect(screen.getByText("ภาพผืนเดิม")).toBeTruthy();
    expect(screen.getByText("💡 อัตลักษณ์ธรรมทูต")).toBeTruthy();

    // Check marquee items
    expect(screen.getAllByText("DHAMMADUTA COLLEGE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WORLD BUDDHIST UNIVERSITY").length).toBeGreaterThan(0);

    // Check quick stats
    expect(screen.getByText("1,200+")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("98.5%")).toBeTruthy();
    expect(screen.getByText("50+")).toBeTruthy();
  });

  it("handles mousemove event to update gaze orientation", () => {
    const { container } = render(<CinematicHero />);
    const section = container.querySelector("section");
    expect(section).toBeTruthy();

    // Fire mousemove
    fireEvent.mouseMove(section!, { clientX: 200, clientY: 150 });
    // Should render gaze indicator
    expect(screen.getAllByText(/มองตามเมาส์/i).length).toBeGreaterThan(0);

    // Can toggle gaze tracking off/on
    const toggleGazeBtn = screen.getByTitle("คลิกเพื่อเปิด/ปิดระบบสายตาและศีรษะหันมองตามเมาส์");
    fireEvent.click(toggleGazeBtn);
    expect(screen.getByText("เปิดระบบมองตามเมาส์")).toBeTruthy();
  });

  it("allows switching visual mode and headline mode", () => {
    render(<CinematicHero />);

    // Switch headline text to DHAMMADUTA
    const dhammadutaBtn = screen.getByText("DHAMMADUTA");
    fireEvent.click(dhammadutaBtn);
    expect(screen.getByRole("heading", { name: /DHAMMADUTA/i })).toBeTruthy();

    // Switch visual to monk-look-left
    const leftBtn = screen.getByText("สมาธิบงกช (หันมองซ้าย)");
    fireEvent.click(leftBtn);
    expect(screen.getByAltText("พระภิกษุสงฆ์ไทย สมาธิบงกช หันมองซ้าย")).toBeTruthy();

    // Switch visual to full-monk
    const fullBtn = screen.getByText("ภาพผืนเดิม");
    fireEvent.click(fullBtn);
    expect(screen.getByAltText("พระสงฆ์ไทยนั่งสมาธิ ภาพผืนเดิม")).toBeTruthy();
  });

  it("opens and closes Dhammaduta identity modal", () => {
    render(<CinematicHero />);

    const modalBtn = screen.getByText("💡 อัตลักษณ์ธรรมทูต");
    fireEvent.click(modalBtn);

    expect(screen.getByText(/สถาปัตยกรรมแยกเลเยอร์/i)).toBeTruthy();

    const closeBtn = screen.getByText("เข้าใจแล้ว / ปิดหน้าต่าง");
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/สถาปัตยกรรมแยกเลเยอร์/i)).toBeNull();
  });

  it("submits subscription form and displays Dhammaduta toast", async () => {
    const { toast } = await import("sonner");
    render(<CinematicHero />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "dhammaduta@college.ac.th" } });

    const submitBtn = screen.getByRole("button", { name: "Submit email" });
    fireEvent.click(submitBtn);

    expect(toast.success).toHaveBeenCalledWith(
      "ลงทะเบียนรับคู่มือหลักสูตรพระธรรมทูตและข่าวสารเรียบร้อยแล้ว อนุโมทนาสาธุครับ!"
    );
  });
});
