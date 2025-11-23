import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 1500); // 1.5 秒後自動消失
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast UI */}
      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg shadow-lg animate-fadeInOut z-50">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}
