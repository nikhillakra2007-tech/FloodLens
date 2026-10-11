import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MechanismGraph from "./MechanismGraph";

vi.mock("@/lib/api/investigations", () => ({
  getGraph: vi.fn().mockResolvedValue({
    investigation_id: "inv-id",
    nodes: [
      { id: "n1", label: "Rainfall", node_type: "input", metadata: {} },
      { id: "n2", label: "Runoff", node_type: "mechanism", metadata: {} },
    ],
    edges: [
      {
        source: "n1",
        target: "n2",
        mechanism: "runoff",
        evidence_ids: ["ev-1"],
        certainty_level: "SUPPORTED",
        relation_type: "CORRELATION",
        support_score: 0.6,
        label: "contributes to",
      },
    ],
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("MechanismGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text alternative for accessibility", async () => {
    render(<MechanismGraph investigationId="inv-id" />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText(/Text alternative/i)).toBeTruthy();
    });
  });
});
