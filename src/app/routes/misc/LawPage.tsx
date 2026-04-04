// src/app/routes/misc/LawPage.tsx
export function LawPage() {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-brand-border">
      <h1 className="text-3xl font-extrabold mb-8 text-brand-text tracking-tight">特定商取引法に基づく表記</h1>
      
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left text-brand-text-muted border-collapse">
          <tbody>
            <tr className="border-b border-brand-border">
              <th className="py-4 pr-4 font-bold text-brand-text w-1/3 whitespace-nowrap">販売事業者名</th>
              <td className="py-4">株式会社○○（※ひな形）</td>
            </tr>
            <tr className="border-b border-brand-border">
              <th className="py-4 pr-4 font-bold text-brand-text w-1/3 whitespace-nowrap">運営統括責任者</th>
              <td className="py-4">代表取締役 ○○ ○○</td>
            </tr>
            <tr className="border-b border-brand-border">
              <th className="py-4 pr-4 font-bold text-brand-text w-1/3 whitespace-nowrap">所在地</th>
              <td className="py-4">〒000-0000<br />東京都○○区○○ 1-2-3</td>
            </tr>
            <tr className="border-b border-brand-border">
              <th className="py-4 pr-4 font-bold text-brand-text w-1/3 whitespace-nowrap">お問い合わせ窓口</th>
              <td className="py-4">お問い合わせフォーム、またはメールにて承ります。<br />Email: example@example.com</td>
            </tr>
            <tr className="border-b border-brand-border">
              <th className="py-4 pr-4 font-bold text-brand-text w-1/3 whitespace-nowrap">販売価格</th>
              <td className="py-4">商品ごとに表示された金額といたします。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}