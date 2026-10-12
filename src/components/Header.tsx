import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>serena<span className="brand-dot">.</span></span>
        </Link>
        <nav>
          <Link href="/search">Explorar</Link>
          <Link href="/admin">Administração</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </div>
    </header>
  );
}
