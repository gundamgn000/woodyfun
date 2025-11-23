import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useCart();

  // 計算總金額
  const total = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace("$", ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] pt-28 pb-20 px-6">

      {/* 標題 */}
      <h1 className="text-4xl font-['Playfair_Display'] text-gray-900 mb-12 text-center tracking-wide">
        購物車
      </h1>

      {/* 空購物車 */}
      {cart.length === 0 && (
        <div className="text-center text-gray-600 mt-20">
          <p className="mb-3">你的購物車目前是空的</p>
          <Link to="/products" className="text-gray-900 underline hover:text-black">
            去逛逛商品 →
          </Link>
        </div>
      )}

      {/* 有商品 */}
      {cart.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-6">

          {cart.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="
                flex flex-col md:flex-row items-center justify-between
                p-6 border border-gray-300 rounded-xl shadow-sm
                bg-white hover:shadow-md transition
              "
            >
              {/* 商品資訊區 */}
              <div className="flex items-center space-x-6 w-full md:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-lg border border-gray-300"
                />

                <div>
                  <p className="text-xl font-['Playfair_Display'] text-gray-900">
                    {item.name}
                  </p>

                  <p className="text-gray-600 text-sm mt-1">尺寸：{item.size}</p>
                  <p className="text-gray-800 text-lg mt-2">{item.price}</p>

                  {/* 數量調整 */}
                  <div className="flex items-center mt-4 space-x-4">
                    <button
                      onClick={() => decreaseQuantity(item.id, item.size)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      -
                    </button>

                    <span className="text-gray-900 text-lg w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id, item.size)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 刪除按鈕 */}
              <button
                onClick={() => removeFromCart(item.id, item.size)}
                className="
                  mt-4 md:mt-0 px-5 py-2 rounded-full
                  bg-red-500 text-white text-sm
                  hover:bg-red-600 transition
                "
              >
                移除
              </button>
            </div>
          ))}

          {/* 總金額區塊 */}
          <div className="p-6 rounded-xl border border-gray-300 bg-white shadow-sm mt-10">
            <div className="flex justify-between mb-6 text-xl text-gray-800">
              <span>總金額</span>
              <span className="font-semibold">${total}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">

              <button
                onClick={clearCart}
                className="
                  px-6 py-3 rounded-full border border-gray-400 text-gray-800
                  hover:bg-gray-100 transition tracking-wide
                "
              >
                清空購物車
              </button>

              {/* 前往結帳 → Link 修正白屏 */}
              <Link
                to="/checkout"
                className="
                  px-6 py-3 rounded-full bg-black text-white text-center
                  hover:bg-gray-800 transition tracking-wide
                "
              >
                前往結帳
              </Link>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
