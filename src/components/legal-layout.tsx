import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ListOrdered } from "lucide-react";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function LegalDoc({
  icon,
  title,
  effectiveDate,
  lastUpdated,
  preamble,
  sections,
}: {
  icon: ReactNode;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  preamble: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Homepage
      </Link>

      <div className="mt-6 flex items-center gap-3">
        {icon}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Effective date</dt>
          <dd>{effectiveDate}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Last updated</dt>
          <dd>{lastUpdated}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Operator</dt>
          <dd>MUST Market, Iyunga, Mbeya, Tanzania</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Contact</dt>
          <dd>
            <LegalEmail />
          </dd>
        </div>
      </dl>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">{preamble}</div>

      <nav
        aria-label="Table of contents"
        className="mt-10 rounded-2xl border border-border bg-surface-2 p-5"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
          <ListOrdered className="h-4 w-4 text-primary" /> Contents
        </h2>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id} className="text-sm">
              <a
                href={`#${s.id}`}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function LegalEmail() {
  return (
    <a
      href="mailto:hassani@mustmarket.store"
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
    >
      hassani@mustmarket.store
    </a>
  );
}

export function LegalDomain() {
  return (
    <a
      href="https://www.mustmarket.store"
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
    >
      www.mustmarket.store
    </a>
  );
}

export function LegalList({ items, ordered }: { items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`space-y-1.5 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

export function LegalTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: [string, string];
  rows: [string, string][];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="hidden sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="w-1/3 px-4 py-3 font-semibold text-foreground">
                {head[0]}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                {head[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-t border-border align-top">
                <th scope="row" className="px-4 py-3 font-medium text-foreground">
                  {k}
                </th>
                <td className="px-4 py-3 text-muted-foreground">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border sm:hidden">
        {rows.map(([k, v]) => (
          <li key={k} className="p-4">
            <p className="text-sm font-semibold text-foreground">{k}</p>
            <p className="mt-1 text-sm text-muted-foreground">{v}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
