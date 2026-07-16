export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-6">
        About Startup Navigator
      </h1>
      <div className="prose prose-invert text-muted-foreground space-y-6 leading-relaxed">
        <p className="text-lg">
          Startup Navigator is a comprehensive guidance portal designed to help founders build, structure, and scale their businesses safely and efficiently.
        </p>
        <p>
          Moving from a startup idea to a compliant corporate entity is filled with legal bottlenecks, tax nuances, and fundraising traps. Our mission is to demystify these hurdles by organizing structured knowledge across ten fundamental building blocks:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li><strong>Company Registration:</strong> Choosing structures (LLC vs C-Corp) and incorporating.</li>
          <li><strong>Funding & Fundraising:</strong> Structuring SAFEs, seed pricing, and cap tables.</li>
          <li><strong>Legal Compliance:</strong> Drafting employee agreements, IP assignments, and bylaws.</li>
          <li><strong>Taxation:</strong> Handling corporate filings, state franchises, and local levies.</li>
          <li><strong>AI Tools:</strong> Automating manual workflows using state-of-the-art models.</li>
        </ul>
        <p>
          We couple standard articles and directories with an advanced AI Search engine that answers complex questions with cited document sources.
        </p>
      </div>
    </div>
  );
}
