// src/app/routes/misc/TermsPage.tsx
export function TermsPage() {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-brand-border">
      <h1 className="text-3xl font-extrabold mb-8 text-brand-text tracking-tight">利用規約</h1>
      <div className="space-y-8 text-brand-text-muted font-medium leading-relaxed">
        <p>本利用規約（以下、「本規約」）は、あくすたポン！（以下、「当サービス」）が提供するサービスの利用条件を定めるものです。</p>
        
        <section>
          <h2 className="text-xl font-bold text-brand-text mb-4 border-l-4 border-brand-primary pl-3">第1条（適用）</h2>
          <p>本規約は、ユーザーと当サービスとの間のサービスの利用に関わる一切の関係に適用されるものとします。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-text mb-4 border-l-4 border-brand-primary pl-3">第2条（禁止事項）</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>他人の著作権、肖像権を侵害する画像のアップロード</li>
          </ul>
        </section>

        <p className="text-sm mt-12 text-brand-text-soft">※ 本ページはひな形です。正式な内容に書き換えてください。</p>
      </div>
    </div>
  );
}