import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import InvestigationDetailPage from "./page";
import Providers from "@/app/providers";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "de9cda17-8daa-448d-813e-9378b97619fb" }),
  useRouter: () => ({ push: vi.fn() }),
}));

describe("InvestigationDetailPage", () => {
  it("renders without throwing client-side exception", async () => {
    const { container } = render(
      <Providers>
        <InvestigationDetailPage />
      </Providers>
    );
    expect(container).toBeDefined();
  });
});
