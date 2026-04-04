const MOCK_BASE_URL = "http://mock-api.test";
const MOCK_USERNAME = "test-user";
const MOCK_PASSWORD = "test-pass";
const EXPECTED_AUTH =
  "Basic " +
  Buffer.from(`${MOCK_USERNAME}:${MOCK_PASSWORD}`).toString("base64");

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

import { apiPost, apiQuery, apiPut, apiDelete } from "@/lib/api";

function makeOkResponse(data: unknown) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(""),
  };
}

function makeErrorResponse(text: string) {
  return {
    ok: false,
    statusText: "Bad Request",
    json: jest.fn(),
    text: jest.fn().mockResolvedValue(text),
  };
}

describe("lib/api", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  // ─── apiPost ───────────────────────────────────────────────────────────────

  describe("apiPost", () => {
    it("deve fazer POST com cabeçalhos corretos e retornar o JSON", async () => {
      const responseData = { result: "created" };
      mockFetch.mockResolvedValueOnce(makeOkResponse(responseData));

      const body = { asset: [{ "@assetType": "tvShows", title: "Dark" }] };
      const result = await apiPost("/invoke/createAsset", body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/invoke/createAsset`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: EXPECTED_AUTH,
          },
          body: JSON.stringify(body),
          cache: "no-store",
        })
      );
      expect(result).toEqual(responseData);
    });

    it("deve lançar erro com a mensagem retornada pela API quando a resposta não for ok", async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse("Série não encontrada"));

      await expect(apiPost("/invoke/createAsset", {})).rejects.toThrow(
        "Série não encontrada"
      );
    });

    it("deve usar o statusText quando o corpo do erro estiver vazio", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
        text: jest.fn().mockResolvedValue(""),
      });

      await expect(apiPost("/any", {})).rejects.toThrow("Internal Server Error");
    });
  });

  // ─── apiQuery ──────────────────────────────────────────────────────────────

  describe("apiQuery", () => {
    it("deve fazer POST com opções de cache (revalidate + tags) e retornar o JSON", async () => {
      const responseData = [{ "@assetType": "tvShows", title: "Dark" }];
      mockFetch.mockResolvedValueOnce(makeOkResponse(responseData));

      const body = { query: { selector: { "@assetType": "tvShows" } } };
      const result = await apiQuery("/query/search", body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/query/search`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: EXPECTED_AUTH,
          },
          body: JSON.stringify(body),
          next: { revalidate: 30, tags: ["ledger-query"] },
        })
      );
      expect(result).toEqual(responseData);
    });

    it("deve lançar erro quando a resposta não for ok", async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse("Recurso não encontrado"));

      await expect(apiQuery("/query/search", {})).rejects.toThrow(
        "Recurso não encontrado"
      );
    });
  });

  // ─── apiPut ────────────────────────────────────────────────────────────────

  describe("apiPut", () => {
    it("deve fazer PUT com cabeçalhos corretos e retornar o JSON", async () => {
      const responseData = { updated: true };
      mockFetch.mockResolvedValueOnce(makeOkResponse(responseData));

      const body = { update: { "@assetType": "tvShows", title: "Dark", recommendedAge: 16 } };
      const result = await apiPut("/invoke/updateAsset", body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/invoke/updateAsset`,
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: EXPECTED_AUTH,
          },
          body: JSON.stringify(body),
          cache: "no-store",
        })
      );
      expect(result).toEqual(responseData);
    });

    it("deve lançar erro quando a resposta não for ok", async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse("Registro não encontrado"));

      await expect(apiPut("/invoke/updateAsset", {})).rejects.toThrow(
        "Registro não encontrado"
      );
    });
  });

  // ─── apiDelete ─────────────────────────────────────────────────────────────

  describe("apiDelete", () => {
    it("deve fazer DELETE com cabeçalhos corretos e retornar o JSON", async () => {
      const responseData = { deleted: true };
      mockFetch.mockResolvedValueOnce(makeOkResponse(responseData));

      const body = { key: [{ "@assetType": "tvShows", "@key": "tvShows:Dark" }] };
      const result = await apiDelete("/invoke/deleteAsset", body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/invoke/deleteAsset`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: EXPECTED_AUTH,
          },
          body: JSON.stringify(body),
          cache: "no-store",
        })
      );
      expect(result).toEqual(responseData);
    });

    it("deve lançar erro quando a resposta não for ok", async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse("Asset não encontrado"));

      await expect(apiDelete("/invoke/deleteAsset", {})).rejects.toThrow(
        "Asset não encontrado"
      );
    });
  });
});
