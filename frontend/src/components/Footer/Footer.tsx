import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="copyright">
            © {currentYear} DHA Tracker. All rights reserved.
          </p>
        </div>
        <div className="footer-section">
          <p className="developer">
            Design and Developed by <strong>Mahendran Krishnan</strong>
          </p>
        </div>
        <div className="footer-section">
          <p className="contact">
            Contact Info: <span className="phone">Phone: 500-450-33375</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

