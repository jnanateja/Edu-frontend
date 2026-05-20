import { Link } from "react-router-dom";

export const STUDENT_TERMS_URL = "/legal/terms-and-conditions";
export const TEACHER_TERMS_URL = "/legal/terms-and-conditions-for-teachers";
export const REFUND_POLICY_URL = "/legal/refund-and-cancellation-policy";
export const PRIVACY_POLICY_URL = "/legal/privacy-policy";

const legalDocuments = [
  { label: "Privacy Policy", href: PRIVACY_POLICY_URL },
  { label: "Terms for Students", href: STUDENT_TERMS_URL },
  { label: "Terms for Teachers", href: TEACHER_TERMS_URL },
  { label: "Refund Policy", href: REFUND_POLICY_URL },
];

interface LegalLinksProps {
  className?: string;
  theme?: "light" | "dark";
}

const LegalLinks = ({ className = "", theme = "light" }: LegalLinksProps) => {
  const linkClassName =
    theme === "dark"
      ? "text-gray-300 hover:text-white"
      : "text-gray-600 hover:text-blue-600";

  return (
    <nav
      aria-label="Legal documents"
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm ${className}`}
    >
      {legalDocuments.map((document) => (
        <Link
          key={document.href}
          to={document.href}
          className={linkClassName}
        >
          {document.label}
        </Link>
      ))}
    </nav>
  );
};

export default LegalLinks;
