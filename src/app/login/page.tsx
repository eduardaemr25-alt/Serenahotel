export default function Login() {
  return (
    <main className="container auth-page">
      <div className="eyebrow dark">ÁREA DO CLIENTE</div>
      <h1>Entre na sua conta.</h1>
      <p>O acesso de clientes estará disponível quando a autenticação for ativada. Não é possível criar uma conta nesta versão.</p>
      <form className="auth-form" action="#">
        <label>E-mail<input type="email" placeholder="nome@exemplo.com" required /></label>
        <label>Palavra-passe<input type="password" placeholder="A sua palavra-passe" required /></label>
        <button className="button button-primary full" type="button" onClick={() => alert('A autenticação ainda não está ativa.')}>Entrar</button>
      </form>
    </main>
  );
}
