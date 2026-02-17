import { parsePagination } from "../parse-pagination";

describe("parsePagination", () => {
  it("returns defaults when no params", () => {
    const params = new URLSearchParams();
    const result = parsePagination(params);
    expect(result).toEqual({ page: 1, limit: 9, skip: 0 });
  });

  it("parses page and limit", () => {
    const params = new URLSearchParams({ page: "3", limit: "10" });
    const result = parsePagination(params);
    expect(result).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it("defaults NaN page to 1", () => {
    const params = new URLSearchParams({ page: "abc" });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
  });

  it("defaults negative page to 1", () => {
    const params = new URLSearchParams({ page: "-1" });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
  });

  it("defaults NaN limit to default", () => {
    const params = new URLSearchParams({ limit: "abc" });
    const result = parsePagination(params);
    expect(result.limit).toBe(9);
  });

  it("clamps limit to max 50", () => {
    const params = new URLSearchParams({ limit: "100" });
    const result = parsePagination(params);
    expect(result.limit).toBe(50);
  });

  it("defaults negative limit to default", () => {
    const params = new URLSearchParams({ limit: "0" });
    const result = parsePagination(params);
    expect(result.limit).toBe(9);
  });

  it("calculates skip correctly", () => {
    const params = new URLSearchParams({ page: "5", limit: "10" });
    const result = parsePagination(params);
    expect(result.skip).toBe(40);
  });
});
