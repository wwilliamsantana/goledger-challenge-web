"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Blocks, Database, GitBranch, ScanSearch } from "lucide-react";

const blocks = [
  {
    icon: Blocks,
    title: "Blockchain Sem Criptomoedas",
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          Quando ouvimos &ldquo;Blockchain&rdquo;, pensamos imediatamente em Bitcoin ou taxas altas de
          transação. O Hyperledger Fabric é diferente. Ele é uma rede{" "}
          <span className="text-foreground/90">permissionada</span> e voltada para o mercado corporativo.
        </p>
        <ul className="mt-4 space-y-2">
          {[
            "Não existem criptomoedas envolvidas.",
            'Não há "mineração" gastando energia.',
            "Apenas servidores e organizações autorizadas (com certificados digitais) podem participar da rede e validar as transações.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          É segurança de nível bancário aplicada ao nosso catálogo de entretenimento.
        </p>
      </>
    ),
  },
  {
    icon: Database,
    title: 'O "Banco de Dados" Duplo',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          Em um sistema comum (como MySQL ou MongoDB), o dado antigo é apagado quando você edita
          uma informação. Na nossa arquitetura, o armazenamento é dividido em duas partes que
          trabalham em conjunto:
        </p>
        <div className="mt-4 space-y-3">
          {[
            {
              label: "World State (Estado Atual)",
              desc: 'Um banco de dados ultrarrápido (CouchDB) que guarda apenas a "foto" exata de como as séries estão neste exato milissegundo. É ele que consultamos para carregar o catálogo de forma instantânea.',
            },
            {
              label: "Ledger (O Livro-Razão)",
              desc: "Um histórico imutável e criptografado contendo absolutamente todas as transações (Criações, Edições e Exclusões) desde o dia zero. Nada nunca é apagado de verdade.",
            },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-xl border border-border/40 bg-background/40 p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: GitBranch,
    title: "O Ciclo de Vida de uma Série",
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          Sempre que você adiciona uma nova temporada ou edita uma série, a requisição não vai
          direto para uma tabela. Ela passa por um processo chamado{" "}
          <span className="text-foreground/90">Consenso</span>:
        </p>
        <ol className="mt-4 space-y-3">
          {[
            {
              step: "1",
              label: "Proposta",
              desc: "Nossa interface envia os dados da nova série para a rede.",
            },
            {
              step: "2",
              label: "Validação (Smart Contracts)",
              desc: 'Os nós da rede rodam o Chaincode (as regras de negócio) para garantir que não faltou nenhum campo obrigatório (como a "Idade Recomendada").',
            },
            {
              step: "3",
              label: "Empacotamento",
              desc: "Se aprovada, a transação recebe um selo criptográfico (Hash), é empacotada em um novo bloco e distribuída para todos os servidores da rede simultaneamente.",
            },
          ].map(({ step, label, desc }) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {step}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </>
    ),
  },
  {
    icon: ScanSearch,
    title: "Rastreabilidade Absoluta",
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          Por ser construído em blockchain, este catálogo possui{" "}
          <span className="text-foreground/90">auditoria nativa</span>. Graças ao endpoint de
          histórico, é possível rastrear toda a linha do tempo de qualquer série ou episódio.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Nós sabemos exatamente qual foi o ID da transação que criou a série, quem a editou e
          quando isso aconteceu, garantindo que a informação não foi adulterada por terceiros.
        </p>
      </>
    ),
  },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-8 lg:px-12">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-100 bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-75 h-75 bg-chart-2/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao catálogo
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 mb-12"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-3">Sobre o Sistema</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            A Tecnologia por Trás do{" "}
            <span className="gradient-text">Catálogo</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Este catálogo de séries não utiliza um banco de dados tradicional. Ele é alimentado por
            uma rede blockchain corporativa baseada em{" "}
            <span className="text-foreground/90">Hyperledger Fabric</span>, orquestrada pelo
            framework <span className="text-foreground/90">CC-Tools</span> da GoLedger. Mas o que
            isso significa na prática?
          </p>
        </motion.div>

        {/* Blocks */}
        <div className="space-y-6">
          {blocks.map(({ icon: Icon, title, content }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-7 shadow-lg shadow-black/10"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
              </div>
              {content}
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center text-xs text-muted-foreground/50"
        >
          StreamHub · Powered by GoLedger Blockchain & Hyperledger Fabric
        </motion.p>
      </div>
    </main>
  );
}
