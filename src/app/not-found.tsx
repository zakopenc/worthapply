import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf8f4] to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#c68a71] opacity-20">404</h1>
          <div className="-mt-20">
            <h2 className="text-4xl font-bold text-[#171411] mb-4">
              Page Not Found
            </h2>
          <p className="text-lg text-neutral-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
          </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#c68a71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#b67961] transition-colors shadow-md"
          >
            <Home size={20} />
            Back to Home
          </Link>
          
          <Link
            href="/features"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#171411] px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors border-2 border-neutral-200"
          >
            <Search size={20} />
            Explore Features
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-neutral-200 pt-8">
          <p className="text-sm text-neutral-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/pricing" className="text-[#c68a71] hover:underline font-medium">
              Pricing
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/compare" className="text-[#c68a71] hover:underline font-medium">
              Compare Tools
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/tools/ats-checker" className="text-[#c68a71] hover:underline font-medium">
              ATS Checker
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/about" className="text-[#c68a71] hover:underline font-medium">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
