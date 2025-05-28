import './Footer.css';

function Footer({ user }: { user: { name: string; loginTime: string } }) {
  return (
    <footer className="footer">
      <p>
        Usuario logueado: <strong>{user.name}</strong> | Hora: <strong>{user.loginTime}</strong>
      </p>
    </footer>
  );
}

export default Footer;