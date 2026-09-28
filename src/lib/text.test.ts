import { describe, expect, it } from "vitest";
import { formatDate, paragraphs } from "@/lib/text";

describe("texto", () => {
  it("parte um texto em parágrafos", () => {
    expect(paragraphs("Um.\n\nDois.\n\n\nTrês.")).toEqual(["Um.", "Dois.", "Três."]);
    expect(paragraphs("   \n\n  ")).toEqual([]);
    expect(paragraphs("Só um parágrafo.")).toEqual(["Só um parágrafo."]);
  });

  it("escreve a data em português", () => {
    expect(formatDate("2026-09-28")).toBe("28 de setembro de 2026");
    expect(formatDate("2026-01-05")).toBe("5 de janeiro de 2026");
  });

  it("não inventa datas inválidas", () => {
    expect(formatDate("2026-02-30")).toBe("2026-02-30");
    expect(formatDate("28/09/2026")).toBe("28/09/2026");
    expect(formatDate("")).toBe("");
  });
});
