
jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/invoke/createAsset/route";
import { revalidateTag } from "next/cache";

const MOCK_BASE_URL = "http://mock-api.test";
const MOCK_USERNAME = "test-user";
const MOCK_PASSWORD = "test-pass";
const EXPECTED_AUTH =
  "Basic " +
  Buffer.from(`${MOCK_USERNAME}:${MOCK_PASSWORD}`).toString("base64");

function mockFetchSuccess(data: unknown) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    text: async () => "",
  } as unknown as Response);
}

function mockFetchFailure(errorMessage: string) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    statusText: "Internal Server Error",
    text: async () => errorMessage,
  } as unknown as Response);
}

describe("Integração: Criação de Série (POST /api/invoke/createAsset)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma série com sucesso, chamar a API externa com autenticação correta e invalidar o cache", async () => {
    const createdShow = {
      "@assetType": "tvShows",
      "@key": "tvShows:Breaking Bad",
      title: "Breaking Bad",
      description: "Um professor de química vira traficante de drogas",
      recommendedAge: 18,
    };
    mockFetchSuccess(createdShow);

    const requestBody = {
      asset: [
        {
          "@assetType": "tvShows",
          title: "Breaking Bad",
          description: "Um professor de química vira traficante de drogas",
          recommendedAge: 18,
        },
      ],
    };

    const req = new NextRequest(
      "http://localhost/api/invoke/createAsset",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(req);
    const data = await response.json();

    // Verifica que o fetch foi chamado corretamente com autenticação e corpo certos
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/invoke/createAsset`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: EXPECTED_AUTH,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      })
    );

    // Verifica que o cache foi invalidado após a criação
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith("ledger-query");

    // Verifica a resposta HTTP
    expect(response.status).toBe(200);
    expect(data).toEqual(createdShow);
  });

  it("deve retornar status 500 e não invalidar o cache quando a API externa retornar erro", async () => {
    mockFetchFailure("Ativo já existe no ledger");

    const requestBody = {
      asset: [{ "@assetType": "tvShows", title: "Breaking Bad" }],
    };

    const req = new NextRequest(
      "http://localhost/api/invoke/createAsset",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error", "Ativo já existe no ledger");

    // Cache NÃO deve ser invalidado quando a operação falhar
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
