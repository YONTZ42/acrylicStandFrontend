import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="relative z-50 flex flex-col items-center justify-center py-1 border-t border-white/10 bg-[#050506]/80 backdrop-blur-md px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[8px] font-bold text-brand-text-soft/70 mb-1.5">
        <Link to="/terms" className="hover:text-brand-primary transition-colors">利用規約</Link>
        <Link to="/privacy" className="hover:text-brand-primary transition-colors">プライバシーポリシー</Link>
        <Link to="/law" className="hover:text-brand-primary transition-colors">特定商取引法に基づく表記</Link>
        <Link to="/contact" className="hover:text-brand-primary transition-colors">お問い合わせ</Link>
      </div>
      <div className="text-[8px] text-brand-text-soft/40 font-medium tracking-wider">
        © {new Date().getFullYear()} バクスタ All rights reserved.
      </div>
    </footer>
  );
}