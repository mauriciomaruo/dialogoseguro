import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3.6-flash";

export const briefingSchema = z.object({
  comQuem: z.string(),
  assunto: z.string(),
  porque: z.string(),
  expectativa: z.string(),
  sobreVoce: z.string(),
  sobreAPessoa: z.string(),
  respostas: z.array(z.object({ pergunta: z.string(), resposta: z.string() })).optional(),
});

export type Briefing = z.infer<typeof briefingSchema>;

const SISTEMA = `Você é o guia dos "Rituais de Conexão para Diálogos Difíceis".
Você ajuda pessoas a preparar conversas emocionalmente delicadas (finanças, sexualidade, drogas, luto, separação, limites familiares, etc).
Escreva SEMPRE em português do Brasil, com linguagem acolhedora, concreta e sem misticismo exagerado, sem jargão terapêutico e sem julgamento.
Nunca substitua ajuda profissional: se houver risco (violência, abuso, ideação suicida), acolha e recomende ajuda especializada dentro do texto.`;

const perguntasSchema = z.object({
  precisaDeMais: z.boolean(),
  leituraInicial: z.string(),
  perguntas: z.array(
    z.object({
      pergunta: z.string(),
      porque: z.string(),
      exemploDeResposta: z.string(),
    }),
  ),
});

export type Perguntas = z.infer<typeof perguntasSchema>;

async function run<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      try {
        return JSON.parse(error.text) as T;
      } catch {
        /* segue para o throw */
      }
    }
    throw error;
  }
}

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

export const analisarContexto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => briefingSchema.parse(input))
  .handler(async ({ data }) => {
    const model = gateway()(MODEL);

    return run(async () => {
      const result = streamText({
        model,
        system: SISTEMA,
        output: Output.object({ schema: perguntasSchema }),
        prompt: `Analise o contexto abaixo de um diálogo difícil e identifique o padrão da necessidade.

Com quem quer conversar: ${data.comQuem}
Assunto: ${data.assunto}
Por que precisa dessa conversa: ${data.porque}
Expectativa e sentimentos: ${data.expectativa}
Sobre quem convida: ${data.sobreVoce}
Sobre a pessoa convidada: ${data.sobreAPessoa}

Escreva "leituraInicial" com 2 a 3 frases mostrando que você entendeu o que está em jogo emocionalmente.
Depois decida se faltam informações essenciais para desenhar o ritual.
Se faltarem, gere de 2 a 4 perguntas curtas, delicadas e específicas (nunca genéricas) e marque precisaDeMais como true.
Se o contexto já for suficiente, precisaDeMais é false e perguntas é uma lista vazia.`,
      });
      return await result.output;
    });
  });

const conviteExemploSchema = z.object({
  titulo: z.string(),
  texto: z.string(),
});

const amuletoSchema = z.object({
  nome: z.string(),
  porque: z.string(),
  comoUsar: z.string(),
});

const ritualSchema = z.object({
  titulo: z.string(),
  leituraDoContexto: z.string(),
  tomEmocional: z.string(),
  convite: z.object({
    formatoSugerido: z.string(),
    porque: z.string(),
    notaDosDoisParticipantes: z.string(),
    avisoIntimacao: z.string(),
    exemploDeIntimacao: z.string(),
    exemplos: z.array(conviteExemploSchema),
  }),
  amuleto: z.object({
    paraVoce: amuletoSchema,
    paraAPessoaConvidada: amuletoSchema,
    observacao: z.string(),
  }),
  ambiente: z.object({
    local: z.string(),
    porque: z.string(),
    explicacaoNeurologica: z.string(),
    ajustes: z.array(z.string()),
    evitar: z.string(),
  }),
  ambientacao: z.object({
    elementos: z.array(
      z.object({
        nome: z.string(),
        detalhe: z.string(),
        explicacaoNeurologica: z.string(),
      }),
    ),
    ritualAntesDaConversa: z.string(),
  }),
  conducao: z.object({
    fraseDeAbertura: z.string(),
    dicas: z.array(z.string()),
    seATensaoSubir: z.string(),
    lembrete: z.string(),
  }),
});

export type Ritual = z.infer<typeof ritualSchema>;

export const gerarRitual = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => briefingSchema.parse(input))
  .handler(async ({ data }) => {
    const model = gateway()(MODEL);
    const extras =
      data.respostas && data.respostas.length
        ? data.respostas.map((r) => `- ${r.pergunta} -> ${r.resposta}`).join("\n")
        : "(sem respostas adicionais)";

    return run(async () => {
      const result = streamText({
        model,
        system: SISTEMA,
        output: Output.object({ schema: ritualSchema }),
        prompt: `Crie um ritual de conexão completo, personalizado para este caso.

Com quem quer conversar: ${data.comQuem}
Assunto: ${data.assunto}
Por que precisa dessa conversa: ${data.porque}
Expectativa e sentimentos: ${data.expectativa}
Sobre quem convida: ${data.sobreVoce}
Sobre a pessoa convidada: ${data.sobreAPessoa}
Informações complementares:
${extras}

Regras obrigatórias:
1) CONVITE: sugira o melhor formato (papel escrito à mão, bilhete, mensagem digital, áudio, etc) considerando o perfil da pessoa convidada, e explique por quê. Em "notaDosDoisParticipantes" deixe claro que convite é convite: um diálogo precisa de duas pessoas e a pessoa convidada tem o direito de recusar ou remarcar. Em "avisoIntimacao" registre que cerca de 50% dos convites feitos como intimação não geram fluidez, e em "exemploDeIntimacao" dê um exemplo curto de frase que soa como intimação ("precisamos conversar hoje, sem desculpa"). Gere exatamente 2 exemplos de texto de convite harmônico, prontos para copiar, sem nenhum traço de intimação, cobrança ou ultimato, e com data/horário em aberto para a outra pessoa escolher.
2) AMULETO: um amuleto para quem convida e outro para a pessoa convidada (podem ser diferentes) — pedra, cristal, planta, objeto afetivo, tecido, etc — coerentes com o perfil de cada uma, com instruções concretas de como usar durante a conversa (onde segurar, o que fazer quando apertar a angústia).
3) AMBIENTE: escolha um ambiente físico específico e dê a explicação neurológica da escolha (amígdala, córtex pré-frontal, nervo vago, sistema de ameaça x acolhimento) em linguagem simples. Inclua ajustes práticos e o que evitar.
4) AMBIENTAÇÃO: de 3 a 5 elementos sensoriais (vela aromática com a fragrância nomeada, banho de ervas, luz, som, chá, temperatura...) cada um com explicação neurológica curta.
5) CONDUÇÃO: dica superficial e generosa de como conduzir, com uma frase de abertura pronta, de 4 a 6 dicas curtas e o que fazer se a tensão subir. Em "lembrete" diga que esta é apenas a preparação do encontro e que a condução minuto a minuto virá em uma próxima experiência do app.

Nada de textos genéricos: cite detalhes reais do caso descrito.`,
      });
      return await result.output;
    });
  });
