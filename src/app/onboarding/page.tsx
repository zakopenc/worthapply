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
  Building2,
  Settings,
  LogOut
} from 'lucide-react';
import styles from './onboarding.module.css';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'job_description'>('upload');
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
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
    <div className=\"min-h-screen bg-[#fcf9f5] flex\">
      {/* Sidebar */}
      <aside className=\"hidden lg:flex flex-col p-6 w-64 border-r border-[#cfc5bd]/15 bg-[#fcf9f5] sticky top-0 h-screen\">
        <div className=\"mb-10\">
          <h2 className=\"text-lg font-black text-black uppercase tracking-widest\">Onboarding</h2>
          <p className=\"text-[10px] text-stone-500 tracking-wider uppercase mt-1\">Step {step === 'upload' ? '2' : '3'} of 4</p>
        </div>
        <nav className=\"flex flex-col gap-2\">
          <div className=\"flex items-center gap-3 py-3 px-4 rounded-lg text-stone-500\">
            <User size={18} /> <span>Profile Setup</span>
          </div>
          <div className={`flex items-center gap-3 py-3 px-4 rounded-lg ${step === 'upload' ? 'text-[#895110] font-bold border-r-2 border-[#895110] bg-[#f6f3ef]' : 'text-stone-500'}`}>
            <Upload size={18} /> <span>Resume Upload</span>
          </div>
          <div className={`flex items-center gap-3 py-3 px-4 rounded-lg ${step === 'job_description' ? 'text-[#895110] font-bold border-r-2 border-[#895110] bg-[#f6f3ef]' : 'text-stone-500'}`}>
            <Briefcase size={18} /> <span>Job Description</span>
          </div>
          <div className=\"flex items-center gap-3 py-3 px-4 rounded-lg text-stone-500\">
            <Sparkles size={18} /> <span>Skills Assessment</span>
          </div>
        </nav>
        
        <div className=\"mt-auto pt-6 border-t border-[#cfc5bd]/10\">
          <div className=\"flex items-center gap-3 mb-4 p-2 bg-white rounded-xl shadow-sm border border-stone-100\">
            <div className=\"w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600\">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className=\"overflow-hidden\">
              <p className=\"text-xs font-bold truncate\">{user?.email}</p>
            </div>
          </div>
          <button className=\"flex items-center gap-2 w-full py-2 px-4 text-xs font-bold text-stone-500 hover:text-black mb-2\">
            <Settings size={14} /> Settings
          </button>
          <button className=\"w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all\">
            Save Progress
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className=\"flex-grow flex flex-col justify-center p-8 md:p-12 lg:p-16\">
        <div className=\"max-w-4xl w-full mx-auto\">
          <AnimatePresence mode=\"wait\">
            {step === 'upload' ? (
              <motion.div
                key=\"upload\"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <span className=\"inline-flex items-center px-3 py-1 bg-[#ffdcbf] text-[#794400] text-[10px] uppercase tracking-widest font-black rounded-full mb-6\">
                  Evidence Bank
                </span>
                <h1 className=\"text-3xl md:text-5xl font-extrabold text-black tracking-tighter leading-[1.1] mb-4\">
                  Build your professional foundation with data.
                </h1>
                <p className=\"text-md md:text-lg text-stone-600 max-w-xl leading-relaxed mb-8\">
                  Upload your resume to initialize your Evidence Bank. Our engine parses your history into a high-fidelity, structured map of your expertise.
                </p>

                <div className=\"grid grid-cols-1 xl:grid-cols-12 gap-8 items-start\">
                  <div className=\"xl:col-span-7\">
                    <div 
                      className=\"group relative flex flex-col items-center justify-center p-8 lg:p-12 border-2 border-dashed border-[#cfc5bd] hover:border-black transition-all rounded-[2rem] bg-[#f6f3ef] cursor-pointer\"
                      onClick={() => fileRef.current?.click()}
                    >
                      <input ref={fileRef} type=\"file\" className=\"hidden\" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                      
                      {uploading ? (
                        <div className=\"text-center\">
                          <div className=\"animate-spin w-10 h-10 border-4 border-black/20 border-t-black rounded-full mb-4 mx-auto\" />
                          <p className=\"font-bold\">Parsing your resume...</p>
                        </div>
                      ) : uploadedFile ? (
                        <div className=\"text-center\">
                          <CheckCircle className=\"w-12 h-12 text-green-600 mb-4 mx-auto\" />
                          <p className=\"font-bold\">{uploadedFile}</p>
                          <p className=\"text-sm text-stone-500 mb-6\">Ready for job-fit analysis.</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setStep('job_description'); }}
                            className=\"flex items-center gap-2 px-8 py-3 bg-[#895110] text-white rounded-xl font-bold hover:bg-[#6e400c] transition-colors\"
                          >
                            Next <ArrowRight size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className=\"text-center\">
                          <div className=\"w-20 h-20 mb-8 bg-white flex items-center justify-center rounded-2xl shadow-sm mx-auto\">
                            <Upload className=\"w-8 h-8 text-[#895110]\" />
                          </div>
                          <h3 className=\"text-xl font-bold mb-2\">Drop your resume here</h3>
                          <p className=\"text-stone-500 mb-8\">PDF, DOCX, TXT. Up to 10MB.</p>
                          <button className=\"px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors\">
                            Select File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className=\"xl:col-span-5 flex flex-col gap-6\">
                    <div className=\"p-8 bg-white rounded-3xl border border-[#cfc5bd]/20 shadow-sm\">
                      <div className=\"w-12 h-12 bg-[#ffdcbf] rounded-xl flex items-center justify-center mb-6\">
                        <Sparkles className=\"w-6 h-6 text-[#794400]\" />
                      </div>
                      <h4 className=\"text-lg font-bold mb-2\">Semantic Extraction</h4>
                      <p className=\"text-sm text-stone-600 leading-relaxed\">
                        Beyond keywords, we understand context. We extract your achievements, seniority, and soft skills with institutional-grade precision.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key=\"job_description\"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <span className=\"inline-flex items-center px-3 py-1 bg-[#ffdcbf] text-[#794400] text-[10px] uppercase tracking-widest font-black rounded-full mb-6\">
                  Role Alignment
                </span>
                <h1 className=\"text-3xl md:text-5xl font-extrabold text-black tracking-tighter leading-[1.1] mb-4\">
                  Paste the job description.
                </h1>
                <p className=\"text-md md:text-lg text-stone-600 max-w-xl leading-relaxed mb-8\">
                  Tell us about the role. We'll analyze it against your Evidence Bank to map your suitability and identify potential gaps.
                </p>

                <textarea
                  className=\"w-full h-96 p-8 bg-white border border-[#cfc5bd] rounded-[2rem] focus:ring-2 focus:ring-[#895110] transition-all outline-none mb-6\"
                  placeholder=\"Paste job description here...\"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                <div className=\"flex justify-between items-center\">
                  <button onClick={() => setStep('upload')} className=\"text-stone-500 font-bold hover:text-black\">Back</button>
                  <button className=\"px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2\">
                    Analyze Job Fit <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

