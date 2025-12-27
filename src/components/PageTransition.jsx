import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("fade-in");

  useEffect(() => {
    // 先讓舊頁面執行 fade-out
    setTransitionStage("fade-out");

    const timeout = setTimeout(() => {
      // 换成新內容
      setDisplayChildren(children);

      // 新頁面淡入 + 缩放
      setTransitionStage("fade-in");

      window.scrollTo(0, 0);
    }, 180); // Apple 級極速：0.18s

    return () => clearTimeout(timeout);
  }, [location, children]);

  return (
    <div className={`page-apple-transition ${transitionStage}`}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
