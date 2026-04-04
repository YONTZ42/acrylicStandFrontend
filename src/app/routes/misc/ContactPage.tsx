// src/app/routes/misc/ContactPage.tsx
export function ContactPage() {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-brand-border max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 text-brand-text tracking-tight">お問い合わせ</h1>
      <p className="text-brand-text-muted mb-8 font-medium">
        サービスに関するご質問、不具合の報告、商品についてのお問い合わせは以下のフォームよりお願いいたします。
      </p>
      
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-2">お名前</label>
          <input type="text" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow" placeholder="山田 太郎" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-brand-text mb-2">メールアドレス</label>
          <input type="email" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow" placeholder="example@email.com" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-brand-text mb-2">お問い合わせ内容</label>
          <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow resize-none" placeholder="こちらに内容をご記入ください..." />
        </div>
        
        <button type="submit" className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-r from-brand-primary to-brand-mint hover:opacity-90 transition-all shadow-md mt-4">
          送信する
        </button>
      </form>
    </div>
  );
}