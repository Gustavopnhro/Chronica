export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 dark:border-border/20 bg-transparent py-6 text-center mt-8">
      <p className="text-sm text-muted-foreground leading-relaxed">
        © {new Date().getFullYear()} <span className="font-medium text-primary">Chronica</span> — Clear after Chaos
        <br />
        <span className="text-xs text-muted-foreground/80">
          Powered by{" "}
          <a
            href="https://www.linkedin.com/in/gustavopinheirops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            Gustavo Pinheiro
          </a>
          {" • "}
          <a
            href="https://github.com/Gustavopnhro/Chronica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            GitHub
          </a>
        </span>
      </p>
    </footer>
  );
}
