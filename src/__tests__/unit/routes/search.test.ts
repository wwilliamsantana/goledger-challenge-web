
jest.mock("@/lib/api", () => ({
  apiPost: jest.fn(),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/query/search/route";
import { apiPost } from "@/lib/api";

const mockApiPost = apiPost as jest.Mock;

describe("POST /api/query/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 com a lista de ativos encontrados", async () => {
    const mockData = {
      result: [
        { "@assetType": "tvShows", title: "Dark", recommendedAge: 16 },
        { "@assetType": "tvShows", title: "Breaking Bad", recommendedAge: 18 },
      ],
    };
    mockApiPost.mockResolvedValueOnce(mockData);

    const body = {
      query: { selector: { "@assetType": "tvShows" } },
    };
    const req = new NextRequest("http://localhost/api/query/search", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(mockApiPost).toHaveBeenCalledWith("/query/search", body);
    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it("deve retornar 200 com lista vazia quando não houver resultados", async () => {
    mockApiPost.mockResolvedValueOnce({ result: [] });

    const body = { query: { selector: { "@assetType": "tvShows", title: "Inexistente" } } };
    const req = new NextRequest("http://localhost/api/query/search", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ result: [] });
  });

  it("deve retornar 500 com a mensagem de erro quando apiPost falhar", async () => {
    mockApiPost.mockRejectedValueOnce(new Error("Timeout ao conectar na API"));

    const req = new NextRequest("http://localhost/api/query/search", {
      method: "POST",
      body: JSON.stringify({ query: {} }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Timeout ao conectar na API" });
  });

  it("deve retornar mensagem genérica quando o erro não for instância de Error", async () => {
    mockApiPost.mockRejectedValueOnce("erro inesperado");

    const req = new NextRequest("http://localhost/api/query/search", {
      method: "POST",
      body: JSON.stringify({ query: {} }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Unknown error" });
  });
});
