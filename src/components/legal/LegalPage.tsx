import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandMark from "../common/BrandMark";
import LegalLinks from "../common/LegalLinks";
import { findLegalDocument } from "./legalDocuments";

const LegalPage = () => {
  const { slug } = useParams();
  const document = findLegalDocument(slug);

  if (!document) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandMark logoClassName="h-9 w-9" nameClassName="text-xl font-bold text-[#0B2E69]" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="bg-white border rounded-lg shadow-sm">
          <div className="px-5 py-8 sm:px-8 border-b">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Legal
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-950">
              {document.title}
            </h1>
            {document.subtitle && (
              <p className="mt-3 text-lg text-gray-600">{document.subtitle}</p>
            )}
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-7">
            {document.sections.map((section, index) => (
              <section key={`${section.title}-${index}`}>
                <h2 className="text-xl font-semibold text-gray-950">
                  {index + 1}. {section.title}
                </h2>
                {section.body?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-7 text-gray-700">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                    {section.bullets.map((item) => (
                      <li key={item} className="leading-7">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
