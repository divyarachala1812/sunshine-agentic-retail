import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div>
          <span className="footer-brand">☀ sunshine</span>
          <p>An Indian shopping and conversational support project by Divya Rachala.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Shop</Link>
          <Link href="/help">Help centre</Link>
          <Link href="/account">Account</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </div>
      <div className="shell footer-note">
        Demonstration store. Products, payments and delivery updates are simulated.
      </div>
    </footer>
  );
}
