
jest.mock("@/lib/api", () => ({
  apiPut: jest.fn(),
  QUERY_CACHE_TAG: "ledger-query",
}));

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}));

import { NextRequest } from "next/server";
import { PUT } from "@/app/api/invoke/updateAsset/route";
import { apiPut } from "@/lib/api";
import { revalidateTag } from "next/cache";

const mockApiPut = apiPut as jest.Mock;
const mockRevalidateTag = revalidateTag as jest.Mock;

describe("PUT /api/invoke/updateAsset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e invalidar o cache após atualizar com sucesso", async () => {
    const mockData = {
      "@assetType": "tvShows",
      title: "Dark",
      description: "Ficção científica - atualizado",
      recommendedAge: 18,
    };
    mockApiPut.mockResolvedValueOnce(mockData);

    const body = {
      update: {
        "@assetType": "tvShows",
        title: "Dark",
        description: "Ficção científica - atualizado",
        recommendedAge: 18,
      },
    };
    const req = new NextRequest("http://localhost/api/invoke/updateAsset", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(mockApiPut).toHaveBeenCalledWith("/invoke/updateAsset", body);
    expect(mockRevalidateTag).toHaveBeenCalledWith("ledger-query");
    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it("deve retornar 500 com a mensagem de erro quando apiPut falhar", async () => {
    mockApiPut.mockRejectedValueOnce(new Error("Série não encontrada"));

    const req = new NextRequest("http://localhost/api/invoke/updateAsset", {
      method: "PUT",
      body: JSON.stringify({ update: {} }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Série não encontrada" });
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem genérica quando o erro não for instância de Error", async () => {
    mockApiPut.mockRejectedValueOnce(null);

    const req = new NextRequest("http://localhost/api/invoke/updateAsset", {
      method: "PUT",
      body: JSON.stringify({ update: {} }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Unknown error" });
  });
});
