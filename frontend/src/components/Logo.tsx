import './Logo.css';

function Logo() {
  return (
    <div className="logo-container">
      <img 
        src="/DailyLogo.png" 
        alt="Daily Routine Logo" 
        className="logo-image"
        onError={() => {
          // Fallback if image doesn't exist yet
          console.warn('Logo image not found. Please add DailyLogo.png to the public folder.');
        }}
      />
    </div>
  );
}

export default Logo;

