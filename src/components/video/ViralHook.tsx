
import { motion } from 'framer-motion';

export default function ViralHook() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.5 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-[1080px] h-[1920px] bg-zinc-950 text-white p-10 flex flex-col justify-center items-center">
      <motion.div variants={container} initial="hidden" animate="show" className="text-center">
        <motion.h1 variants={item} className="text-8xl font-bold mb-10">Stop Spraying & Praying</motion.h1>
        <motion.p variants={item} className="text-5xl text-zinc-400">Bulk applying isn&apos;t a strategy, it&apos;s a vanity metric.</motion.p>
      </motion.div>
    </div>
  );
}
