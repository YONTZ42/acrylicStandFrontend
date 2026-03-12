import './App.css'; // もしあれば残す、なければ削除
// import './index.css'; // main.tsx で読み込んでいるはずなので、ここでは不要

function App() {
  const products = [
    {
      id: 1,
      name: 'ミニチュア博物館セットA',
      description: '歴史的な建造物のミニチュアコレクション。',
      price: '¥3,500',
      imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=SetA', // ダミー画像URL
    },
    {
      id: 2,
      name: 'ミニチュア博物館セットB',
      description: '世界の絶景を再現したミニチュアコレクション。',
      price: '¥4,200',
      imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=SetB', // ダミー画像URL
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8"> {/* 背景色とパディング */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          ミニチュア博物館へようこそ！
        </h1>
        <p className="text-lg text-gray-600">
          歴史と絶景が手のひらサイズで楽しめます。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {product.name}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-indigo-600">
                  {product.price}
                </span>
                <button className="bg-indigo-500 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-200">
                  詳細を見る
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>&copy; 2023 Miniature Museum. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;