import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Landing from "./Landing";

describe("Landing", () => {
  it("sets an honest freelancer-operations expectation and routes visitors into onboarding", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /keep client work clear/i })).toBeInTheDocument();
    expect(screen.getByText(/client operations for independent developers/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create your workspace/i })).toHaveAttribute("href", "/signup");
    expect(screen.queryByText(/automatic invoice/i)).not.toBeInTheDocument();
  });
});
