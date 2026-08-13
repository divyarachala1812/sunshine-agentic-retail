import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div>
          <span className="footer-brand">☀ sunshine</span>
          <p>An India-first retail and multi-agent portfolio project by Divya Rachala.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Shop</Link>
          <Link href="/agents">How agents work</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </div>
      <div className="shell footer-note">
        Demonstration store. Products, payments and delivery updates are simulated.
      </div>
    </footer>
  );
}
