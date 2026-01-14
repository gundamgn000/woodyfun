// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#f39c42', // 呼應屋頂顏色
        'brand-green': '#94a672',  // 呼應葉子顏色
        'brand-wood': '#6a625d',   // 呼應文字與線條顏色
        'brand-bg': '#faf9f6',     // 建議的溫潤底色
      },
    },
  },
  plugins: [],
}