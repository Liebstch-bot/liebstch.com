import Link from "next/link";
import { Icon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="footer-brand">liebstch</div>
          <p>把每一次投递、面试和复盘，变成下一个人的参考。</p>
        </div>
        <div className="footer-links">
          <Link href="/portfolio">作品集</Link>
          <Link href="/community">论坛广场</Link>
          <Link href="/dashboard">求职跟踪台</Link>
          <a href="mailto:hello@liebstch.com">联系我 <Icon name="arrow" size={14} /></a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} liebstch.com</span>
        <span>隐私优先 · 数据默认私有 · 社区公开共建</span>
      </div>
    </footer>
  );
}
