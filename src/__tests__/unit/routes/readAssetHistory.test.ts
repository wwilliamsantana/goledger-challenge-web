
jest.mock("@/lib/api", () => ({
  apiPost: jest.fn(),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/query/readAssetHistory/route";
import { apiPost } from "@/lib/api";

const mockApiPost = apiPost as jest.Mock;

describe("POST /api/query/readAssetHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 com o histórico de um ativo", async () => {
    const mockHistory = [
      {
        _txId: "abc123",
        _timestamp: "2025-01-01T00:00:00Z",
        _isDelete: false,
        "@assetType": "tvShows",
        title: "Dark",
        description: "Descrição inicial",
        recommendedAge: 14,
      },
      {
        _txId: "def456",
        _timestamp: "2025-06-01T00:00:00Z",
        _isDelete: false,
        "@assetType": "tvShows",
        title: "Dark",
        description: "Descrição atualizada",
        recommendedAge: 16,
      },
    ];
    mockApiPost.mockResolvedValueOnce(mockHistory);

    const body = { key: { "@assetType": "tvShows", "@key": "tvShows:Dark" } };
    const req = new NextRequest(
      "http://localhost/api/query/readAssetHistory",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(req);
    const data = await response.json();

    expect(mockApiPost).toHaveBeenCalledWith("/query/readAssetHistory", body);
    expect(response.status).toBe(200);
    expect(data).toEqual(mockHistory);
    expect(data).toHaveLength(2);
  });

  it("deve retornar 200 com histórico de deleção", async () => {
    const mockHistory = [
      {
        _txId: "xyz789",
        _timestamp: "2025-12-01T00:00:00Z",
        _isDelete: true,
        "@assetType": "tvShows",
        title: "Dark",
      },
    ];
    mockApiPost.mockResolvedValueOnce(mockHistory);

    const body = { key: { "@assetType": "tvShows", "@key": "tvShows:Dark" } };
    const req = new NextRequest(
      "http://localhost/api/query/readAssetHistory",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0]._isDelete).toBe(true);
  });

  it("deve retornar 500 com a mensagem de erro quando apiPost falhar", async () => {
    mockApiPost.mockRejectedValueOnce(new Error("Asset não encontrado no ledger"));

    const req = new NextRequest(
      "http://localhost/api/query/readAssetHistory",
      {
        method: "POST",
        body: JSON.stringify({ key: {} }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Asset não encontrado no ledger" });
  });

  it("deve retornar mensagem genérica quando o erro não for instância de Error", async () => {
    mockApiPost.mockRejectedValueOnce(undefined);

    const req = new NextRequest(
      "http://localhost/api/query/readAssetHistory",
      {
        method: "POST",
        body: JSON.stringify({ key: {} }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Unknown error" });
  });
});
