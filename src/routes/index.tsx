import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  Flame,
  Gem,
  Home,
  Leaf,
  Mail,
  MessageCircleHeart,
  RotateCcw,
  Copy,
  Loader2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

import heroImage from "@/assets/hero-ritual.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { analisarContexto, gerarRitual, type Perguntas, type Ritual } from "@/lib/ritual.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rituais de Conexão para Diálogos Difíceis" },
      {
        name: "description",
        content:
          "Prepare aquela conversa difícil com um ritual em 4 pilares: convite harmônico, amuleto, ambiente e ambientação.",
      },
      { property: "og:title", content: "Rituais de Conexão para Diálogos Difíceis" },
      {
        property: "og:description",
        content:
          "Convite, amuleto, ambiente e ambientação: um ritual personalizado para conversas que você adia há tempo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SUGESTOES = [
  "Minha esposa / meu marido",
  "Meu filho / minha filha",
  "Minha mãe",
  "Meu pai",
  "Meu irmão / minha irmã",
  "Um(a) amigo(a)",
  "Meu chefe",
  "Um(a) colega de trabalho",
  "Meu ex-companheiro(a)",
  "Meu sogro / minha sogra",
];

type Form = {
  comQuem: string;
  assunto: string;
  porque: string;
  expectativa: string;
  sobreVoce: string;
  sobreAPessoa: string;
};

const VAZIO: Form = {
  comQuem: "",
  assunto: "",
  porque: "",
  expectativa: "",
  sobreVoce: "",
  sobreAPessoa: "",
};

function SectionTitle({
  icon: Icon,
  step,
  title,
}: {
  icon: typeof Flame;
  step: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{step}</p>
        <h3 className="font-display text-2xl leading-tight">{title}</h3>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-display text-lg font-medium">{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  );
}

function CopyBlock({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-lg border border-border bg-paper p-5 text-paper-foreground shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-display text-xl">{titulo}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(texto);
            toast.success("Convite copiado");
          }}
        >
          <Copy className="size-4" /> Copiar
        </Button>
      </div>
      <p className="whitespace-pre-wrap font-display text-lg leading-relaxed">{texto}</p>
    </div>
  );
}

function Index() {
  const analisar = useServerFn(analisarContexto);
  const gerar = useServerFn(gerarRitual);

  const [form, setForm] = useState<Form>(VAZIO);
  const [perguntas, setPerguntas] = useState<Perguntas | null>(null);
  const [respostas, setRespostas] = useState<string[]>([]);
  const [ritual, setRitual] = useState<Ritual | null>(null);
  const [loading, setLoading] = useState<"analise" | "ritual" | null>(null);

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const pronto = form.comQuem.trim() && form.assunto.trim() && form.porque.trim();

  function erro(e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("429")) {
      toast.error("Muitas pessoas ao mesmo tempo. Tente em instantes.");
    } else if (msg.includes("402")) {
      toast.error("Os créditos de IA acabaram. Recarregue para continuar.");
    } else {
      toast.error("Não consegui preparar o ritual agora. Tente novamente.");
    }
  }


  async function onAnalisar() {
    setLoading("analise");
    try {
      const r = await analisar({ data: form });
      setPerguntas(r);
      setRespostas(new Array(r.perguntas.length).fill(""));
      if (!r.precisaDeMais || r.perguntas.length === 0) {
        await construir([]);
        return;
      }
      setTimeout(() => document.getElementById("perguntas")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (e) {
      erro(e);
    } finally {
      setLoading(null);
    }
  }

  async function construir(extras: { pergunta: string; resposta: string }[]) {
    setLoading("ritual");
    try {
      const r = await gerar({ data: { ...form, respostas: extras } });
      setRitual(r);
      setTimeout(() => document.getElementById("ritual")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (e) {
      erro(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Duas mãos quase se tocando sobre uma mesa de madeira à luz de vela, com uma pedra e um ramo de alecrim"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0.02_45/0.82)] via-[oklch(0.18_0.02_45/0.7)] to-[oklch(0.18_0.02_45/0.95)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center text-[oklch(0.96_0.015_84)] md:py-36">
          <p className="text-xs uppercase tracking-[0.35em] text-[oklch(0.82_0.11_62)]">
            um ritual antes da conversa
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
            Rituais de Conexão para Diálogos Difíceis
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[oklch(0.88_0.02_84)]">
            Existe uma conversa que você adia há semanas. Conte o contexto e receba um ritual em
            quatro pilares — convite, amuleto, ambiente e ambientação — para que ela finalmente
            aconteça com fluidez.
          </p>
          <Button
            size="lg"
            className="mt-10"
            onClick={() => document.getElementById("briefing")?.scrollIntoView({ behavior: "smooth" })}
          >
            Preparar minha conversa <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <section id="briefing" className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">O contexto</p>
        <h2 className="mt-3 font-display text-4xl">Me conte sobre essa conversa</h2>
        <p className="mt-3 text-muted-foreground">
          Quanto mais concreto você for, mais o ritual vai parecer feito à mão para vocês dois.
        </p>

        <div className="mt-10 space-y-8 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-9">
          <Field label="Com quem você quer conversar?">
            <Input
              value={form.comQuem}
              onChange={(e) => set("comQuem")(e.target.value)}
              placeholder="Ex.: minha esposa"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("comQuem")(s)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    form.comQuem === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Sobre que assunto gostaria de conversar?">
            <Textarea
              rows={3}
              value={form.assunto}
              onChange={(e) => set("assunto")(e.target.value)}
              placeholder="Ex.: as finanças da casa e a vontade de trocar de carro"
            />
          </Field>

          <Field label="Por que precisa ter essa conversa?">
            <Textarea
              rows={3}
              value={form.porque}
              onChange={(e) => set("porque")(e.target.value)}
              placeholder="O que aconteceu, o que está te movendo agora"
            />
          </Field>

          <Field
            label="Descreva qual sua expectativa para essa conversa"
            hint="O que está sentindo, o que espera, como acredita que vai ser."
          >
            <Textarea
              rows={4}
              value={form.expectativa}
              onChange={(e) => set("expectativa")(e.target.value)}
            />
          </Field>

          <Field label="Fale um pouco sobre você" hint="Jeito, temperamento, o que te acalma.">
            <Textarea rows={3} value={form.sobreVoce} onChange={(e) => set("sobreVoce")(e.target.value)} />
          </Field>

          <Field
            label="Fale um pouco sobre a pessoa que está convidando"
            hint="Como ela reage, do que gosta, o que a deixa confortável."
          >
            <Textarea
              rows={3}
              value={form.sobreAPessoa}
              onChange={(e) => set("sobreAPessoa")(e.target.value)}
            />
          </Field>

          <Button size="lg" className="w-full" disabled={!pronto || loading !== null} onClick={onAnalisar}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Flame className="size-4" />}
            {loading === "analise"
              ? "Lendo o seu contexto..."
              : loading === "ritual"
                ? "Preparando o ritual..."
                : "Analisar o contexto"}
          </Button>
        </div>
      </section>

      {perguntas && perguntas.perguntas.length > 0 && !ritual ? (
        <section id="perguntas" className="mx-auto max-w-3xl px-6 pb-20">
          <div className="rounded-xl border border-border bg-paper p-6 text-paper-foreground md:p-9">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              antes de seguir
            </p>
            <h2 className="mt-3 font-display text-3xl">{perguntas.leituraInicial}</h2>
            <p className="mt-3 text-muted-foreground">
              Algumas perguntas para eu entender melhor o que está em jogo:
            </p>
            <div className="mt-8 space-y-7">
              {perguntas.perguntas.map((p, i) => (
                <div key={p.pergunta} className="space-y-2">
                  <Label className="font-display text-lg">{p.pergunta}</Label>
                  <p className="text-sm text-muted-foreground">{p.porque}</p>
                  <Textarea
                    rows={3}
                    value={respostas[i] ?? ""}
                    placeholder={p.exemploDeResposta}
                    onChange={(e) =>
                      setRespostas((r) => r.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                disabled={loading !== null}
                onClick={() =>
                  construir(
                    perguntas.perguntas.map((p, i) => ({
                      pergunta: p.pergunta,
                      resposta: respostas[i] ?? "",
                    })),
                  )
                }
              >
                {loading === "ritual" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Flame className="size-4" />
                )}
                Criar meu ritual
              </Button>
              <Button variant="ghost" size="lg" disabled={loading !== null} onClick={() => construir([])}>
                Prefiro não responder agora
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {ritual ? (
        <section id="ritual" className="mx-auto max-w-3xl px-6 pb-24">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">seu ritual</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">{ritual.titulo}</h2>
            <p className="mt-4 text-muted-foreground">{ritual.leituraDoContexto}</p>
            <p className="mt-2 text-sm italic text-muted-foreground">{ritual.tomEmocional}</p>
          </div>

          <div className="mt-12 space-y-6">
            <article className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-9">
              <SectionTitle icon={Mail} step="Pilar 1" title="O convite" />
              <p className="mt-5 font-display text-xl">{ritual.convite.formatoSugerido}</p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{ritual.convite.porque}</p>

              <div className="mt-6 rounded-lg border-l-4 border-ember bg-secondary p-4">
                <p className="text-sm leading-relaxed">{ritual.convite.notaDosDoisParticipantes}</p>
              </div>
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="flex items-center gap-2 font-medium text-destructive">
                  <AlertTriangle className="size-4" /> Convite não é intimação
                </p>
                <p className="mt-2 text-sm leading-relaxed">{ritual.convite.avisoIntimacao}</p>
                <p className="mt-2 text-sm italic text-muted-foreground">
                  Ex.: “{ritual.convite.exemploDeIntimacao}”
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  dois convites harmônicos prontos
                </p>
                {ritual.convite.exemplos.map((e) => (
                  <CopyBlock key={e.titulo} titulo={e.titulo} texto={e.texto} />
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-9">
              <SectionTitle icon={Gem} step="Pilar 2" title="O amuleto" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { rotulo: "Para você", a: ritual.amuleto.paraVoce },
                  { rotulo: "Para quem você convida", a: ritual.amuleto.paraAPessoaConvidada },
                ].map(({ rotulo, a }) => (
                  <div key={rotulo} className="rounded-lg bg-secondary p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{rotulo}</p>
                    <p className="mt-2 font-display text-2xl">{a.nome}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.porque}</p>
                    <Separator className="my-4" />
                    <p className="text-sm leading-relaxed">{a.comoUsar}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm italic text-muted-foreground">{ritual.amuleto.observacao}</p>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-9">
              <SectionTitle icon={Home} step="Pilar 3" title="O ambiente" />
              <p className="mt-5 font-display text-xl">{ritual.ambiente.local}</p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{ritual.ambiente.porque}</p>
              <div className="mt-5 rounded-lg bg-accent p-4 text-accent-foreground">
                <p className="text-xs uppercase tracking-[0.2em]">por que o cérebro agradece</p>
                <p className="mt-2 text-sm leading-relaxed">{ritual.ambiente.explicacaoNeurologica}</p>
              </div>
              <ul className="mt-5 space-y-2">
                {ritual.ambiente.ajustes.map((a) => (
                  <li key={a} className="flex gap-3 text-sm leading-relaxed">
                    <Leaf className="mt-0.5 size-4 shrink-0 text-moss" />
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Evite:</span> {ritual.ambiente.evitar}
              </p>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-9">
              <SectionTitle icon={Flame} step="Pilar 4" title="A ambientação" />
              <div className="mt-6 space-y-5">
                {ritual.ambientacao.elementos.map((e) => (
                  <div key={e.nome} className="rounded-lg border border-border bg-paper p-5 text-paper-foreground">
                    <p className="font-display text-xl">{e.nome}</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{e.detalhe}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {e.explicacaoNeurologica}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-secondary p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  na hora antes da conversa
                </p>
                <p className="mt-2 text-sm leading-relaxed">{ritual.ambientacao.ritualAntesDaConversa}</p>
              </div>
            </article>

            <article className="rounded-xl border border-ember/40 bg-card p-6 shadow-[var(--shadow-card)] md:p-9">
              <SectionTitle icon={MessageCircleHeart} step="E então" title="Como conduzir a conversa" />
              <p className="mt-6 font-display text-2xl leading-snug">
                “{ritual.conducao.fraseDeAbertura}”
              </p>
              <ul className="mt-6 space-y-3">
                {ritual.conducao.dicas.map((d) => (
                  <li key={d} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ember" />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-lg bg-secondary p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  se a tensão subir
                </p>
                <p className="mt-2 text-sm leading-relaxed">{ritual.conducao.seATensaoSubir}</p>
              </div>
              <p className="mt-6 text-sm italic text-muted-foreground">{ritual.conducao.lembrete}</p>
            </article>
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setRitual(null);
                setPerguntas(null);
                setForm(VAZIO);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <RotateCcw className="size-4" /> Preparar outra conversa
            </Button>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        Rituais de Conexão para Diálogos Difíceis · este app prepara o encontro, não substitui apoio
        profissional.
      </footer>
    </main>
  );
}
