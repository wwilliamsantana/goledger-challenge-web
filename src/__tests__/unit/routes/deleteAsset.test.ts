
jest.mock("@/lib/api", () => ({
  apiDelete: jest.fn(),
  QUERY_CACHE_TAG: "ledger-query",
}));

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}));

import { NextRequest } from "next/server";
import { DELETE } from "@/app/api/invoke/deleteAsset/route";
import { apiDelete } from "@/lib/api";
import { revalidateTag } from "next/cache";

const mockApiDelete = apiDelete as jest.Mock;
const mockRevalidateTag = revalidateTag as jest.Mock;

describe("DELETE /api/invoke/deleteAsset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e invalidar o cache após deletar com sucesso", async () => {
    const mockData = { deleted: true };
    mockApiDelete.mockResolvedValueOnce(mockData);

    const body = { key: [{ "@assetType": "tvShows", "@key": "tvShows:Dark" }] };
    const req = new NextRequest("http://localhost/api/invoke/deleteAsset", {
      method: "DELETE",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(mockApiDelete).toHaveBeenCalledWith("/invoke/deleteAsset", body);
    expect(mockRevalidateTag).toHaveBeenCalledWith("ledger-query");
    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it("deve retornar 500 com a mensagem de erro quando apiDelete falhar", async () => {
    mockApiDelete.mockRejectedValueOnce(new Error("Asset não encontrado"));

    const req = new NextRequest("http://localhost/api/invoke/deleteAsset", {
      method: "DELETE",
      body: JSON.stringify({ key: [] }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Asset não encontrado" });
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem genérica quando o erro não for instância de Error", async () => {
    mockApiDelete.mockRejectedValueOnce({ code: 500 });

    const req = new NextRequest("http://localhost/api/invoke/deleteAsset", {
      method: "DELETE",
      body: JSON.stringify({ key: [] }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Unknown error" });
  });
});
