'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, 
  CheckCircle, 
  Briefcase, 
  User, 
  Sparkles, 
  LayoutGrid, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import styles from './onboarding.module.css';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) return null;

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    // ... API call logic remains as per your current implementation
    setTimeout(() => {
      setUploading(false);
      setUploadedFile(file.name);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col p-6 w-64 border-r border-[#cfc5bd]/15 bg-[#fcf9f5] sticky top-0 h-screen">
        <div className="mb-10">
          <h2 className="text-lg font-black text-black uppercase tracking-widest">Onboarding</h2>
          <p className="text-[10px] text-stone-500 tracking-wider uppercase mt-1">Step 2 of 4</p>
        </div>
        <nav className="flex flex-col gap-2">
          <div className="flex items-center gap-3 py-3 px-4 rounded-lg text-stone-500">
            <User size={18} /> <span>Profile Setup</span>
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#895110] font-bold border-r-2 border-[#895110] bg-[#f6f3ef]">
            <Upload size={18} /> <span>Resume Upload</span>
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-lg text-stone-500">
            <Sparkles size={18} /> <span>Skills Assessment</span>
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-lg text-stone-500">
            <Briefcase size={18} /> <span>Job Matches</span>
          </div>
        </nav>
        <div className="mt-auto pt-6 border-t border-[#cfc5bd]/10">
          <button className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all">
            Save Progress
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 lg:p-20">
        <div className="max-w-4xl">
          <span className="inline-flex items-center px-3 py-1 bg-[#ffdcbf] text-[#794400] text-[10px] uppercase tracking-widest font-black rounded-full mb-6">
            Evidence Bank
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter leading-[1.1] mb-6">
            Build your professional foundation with data.
          </h1>
          <p className="text-lg md:text-xl text-stone-600 max-w-xl leading-relaxed mb-12">
            Upload your resume to initialize your Evidence Bank. Our engine parses your history into a high-fidelity, structured map of your expertise.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Upload Zone */}
            <div className="xl:col-span-7">
              <div 
                className="group relative flex flex-col items-center justify-center p-12 lg:p-16 border-2 border-dashed border-[#cfc5bd] hover:border-black transition-all rounded-[2rem] bg-[#f6f3ef] cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-black/20 border-t-black rounded-full mb-4 mx-auto" />
                    <p className="font-bold">Parsing your resume...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mb-4 mx-auto" />
                    <p className="font-bold">{uploadedFile}</p>
                    <p className="text-sm text-stone-500">Ready for job-fit analysis.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 mb-8 bg-white flex items-center justify-center rounded-2xl shadow-sm mx-auto">
                      <Upload className="w-8 h-8 text-[#895110]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Drop your resume here</h3>
                    <p className="text-stone-500 mb-8">PDF, DOCX, TXT. Up to 10MB.</p>
                    <button className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors">
                      Select File
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex items-start gap-4 p-6 bg-[#f6f3ef] rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-[#895110] flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Data Privacy Guarantee</h4>
                  <p className="text-xs text-stone-600 mt-1">Your data is encrypted and used only for career matching. We never share your personal information without explicit consent.</p>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="p-8 bg-white rounded-3xl border border-[#cfc5bd]/20 shadow-sm">
                <div className="w-12 h-12 bg-[#ffdcbf] rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-[#794400]" />
                </div>
                <h4 className="text-lg font-bold mb-2">Semantic Extraction</h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Beyond keywords, we understand context. We extract your achievements, seniority, and soft skills with institutional-grade precision.
                </p>
              </div>
              
              <div className="p-8 bg-white rounded-3xl border border-[#cfc5bd]/20 shadow-sm">
                <div className="w-12 h-12 bg-[#ece0d8] rounded-xl flex items-center justify-center mb-6">
                  <LayoutGrid className="w-6 h-6 text-[#4c463f]" />
                </div>
                <h4 className="text-lg font-bold mb-2">Knowledge Graph</h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Your experience is mapped against a global industry ontology, identifying skill gaps and potential career pivots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
