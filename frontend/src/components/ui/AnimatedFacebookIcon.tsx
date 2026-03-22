import { Facebook } from "lucide-react";

type Props = {
  size?: number;
  href?: string;
  className?: string;
  ariaLabel?: string;
};

const AnimatedFacebookIcon = ({
  size = 52,
  href = "https://facebook.com/yourpage",
  className = "",
  ariaLabel = "Follow us on Facebook",
}: Props) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`group relative inline-flex items-center justify-center rounded-full transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-300 group-hover:opacity-100 opacity-90"
        style={{
          background:
            "linear-gradient(135deg, #3b5998 0%, #1877f2 40%, #0052cc 100%)",
        }}
      />

      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(24, 119, 242, 0.5), transparent 70%)",
          filter: "blur(10px)",
          transform: "scale(1.35)",
        }}
      />

      {/* Inner glassy surface */}
      <div
        className="relative z-10 flex h-full w-full items-center justify-center rounded-full transition-shadow duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          boxShadow: "0 4px 12px -4px rgba(59, 89, 152, 0.2)",
        }}
      >
        <Facebook
          size={Math.round(size * 0.45)}
          className="text-white transition-transform duration-300 ease-out group-hover:scale-110"
          strokeWidth={1.6}
        />
      </div>
    </a>
  );
};

export default AnimatedFacebookIcon;
