// src/app/routes/misc/PrivacyPage.tsx
export function PrivacyPage() {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-brand-border">
      <h1 className="text-3xl font-extrabold mb-8 text-brand-text tracking-tight">プライバシーポリシー</h1>
      <div className="space-y-8 text-brand-text-muted font-medium leading-relaxed">
        <p>当サービスは、ユーザーの個人情報について以下のとおりプライバシーポリシーを定めます。</p>
        
        <section>
          <h2 className="text-xl font-bold text-brand-text mb-4 border-l-4 border-brand-primary pl-3">1. 個人情報の収集方法</h2>
          <p>当サービスは、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレスなどの個人情報をお尋ねすることがあります。また、アップロードされた画像データについても、サービス提供の目的の範囲内で一時的に保存します。</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-text mb-4 border-l-4 border-brand-primary pl-3">2. 個人情報を収集・利用する目的</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>当サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに回答するため</li>
            <li>ご注文いただいた商品の発送のため</li>
          </ul>
        </section>

        <p className="text-sm mt-12 text-brand-text-soft">※ 本ページはひな形です。正式な内容に書き換えてください。</p>
      </div>
    </div>
  );
}