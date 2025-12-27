import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 1800); // 高級電商標準：1.8 秒淡出
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="toast-container">
          <div className="toast-message">{toast}</div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
