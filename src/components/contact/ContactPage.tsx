import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Youtube } from "lucide-react";
import BrandMark from "../common/BrandMark";
import LegalLinks from "../common/LegalLinks";

const telegramUrl = "https://t.me/k3rankersadda";
const youtubeUrl = "https://youtube.com/@k3rankersadda?si=esYjGvzo76Cl9es3";
const phoneNumber = "+91 9052181225";
const phoneHref = "tel:+919052181225";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-gray-900">
      <header className="bg-white/90 backdrop-blur-sm border-b">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-950">
            Contact K3 Rankers Adda
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Reach us for course questions, enrollment support, or updates.
          </p>
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition"
          >
            <div className="h-11 w-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Telegram</h2>
            <p className="mt-2 text-gray-600">Join our Telegram channel for updates.</p>
            <p className="mt-4 text-sm font-medium text-blue-700">t.me/k3rankersadda</p>
          </a>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition"
          >
            <div className="h-11 w-11 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <Youtube className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold">YouTube</h2>
            <p className="mt-2 text-gray-600">Watch videos and learning updates.</p>
            <p className="mt-4 text-sm font-medium text-blue-700">@k3rankersadda</p>
          </a>

          <a
            href={phoneHref}
            className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition"
          >
            <div className="h-11 w-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Phone</h2>
            <p className="mt-2 text-gray-600">Call us for direct support.</p>
            <p className="mt-4 text-sm font-medium text-blue-700">{phoneNumber}</p>
          </a>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} K3 Rankers adda. All rights reserved.
          </p>
          <LegalLinks theme="dark" className="mt-4" />
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
