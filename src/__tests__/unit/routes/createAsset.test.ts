
jest.mock("@/lib/api", () => ({
  apiPost: jest.fn(),
  QUERY_CACHE_TAG: "ledger-query",
}));

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/invoke/createAsset/route";
import { apiPost } from "@/lib/api";
import { revalidateTag } from "next/cache";

const mockApiPost = apiPost as jest.Mock;
const mockRevalidateTag = revalidateTag as jest.Mock;

describe("POST /api/invoke/createAsset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 com os dados criados e invalidar o cache", async () => {
    const mockData = {
      "@assetType": "tvShows",
      "@key": "tvShows:Dark",
      title: "Dark",
      description: "Ficção científica alemã",
      recommendedAge: 16,
    };
    mockApiPost.mockResolvedValueOnce(mockData);

    const body = {
      asset: [{ "@assetType": "tvShows", title: "Dark", description: "Ficção científica alemã", recommendedAge: 16 }],
    };
    const req = new NextRequest("http://localhost/api/invoke/createAsset", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(mockApiPost).toHaveBeenCalledWith("/invoke/createAsset", body);
    expect(mockRevalidateTag).toHaveBeenCalledWith("ledger-query");
    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it("deve retornar 500 com a mensagem de erro quando apiPost falhar", async () => {
    mockApiPost.mockRejectedValueOnce(new Error("Ativo já existe"));

    const req = new NextRequest("http://localhost/api/invoke/createAsset", {
      method: "POST",
      body: JSON.stringify({ asset: [] }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Ativo já existe" });
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem de erro genérica quando o erro não for instância de Error", async () => {
    mockApiPost.mockRejectedValueOnce("string error");

    const req = new NextRequest("http://localhost/api/invoke/createAsset", {
      method: "POST",
      body: JSON.stringify({ asset: [] }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Unknown error" });
  });
});
