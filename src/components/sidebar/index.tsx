import { useEffect, useRef } from "react";
import { useUiStore } from "../../store/ui";
import styles from "./sidebar.module.scss";
import DashboardIcon from "../../assets/dashboard.svg?react";
import clsx from "clsx";

export type SidebarItem = {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
};

type SidebarProps = {
  items?: SidebarItem[];
  defaultCollapsed?: boolean;
  collapsedWidth?: number; // px
  expandedWidth?: number; // px
  className?: string;
  style?: React.CSSProperties;
};

export const Sidebar = ({
  items = [],
  defaultCollapsed = false,
  collapsedWidth = 64,
  expandedWidth = 240,
  className,
  style,
}: SidebarProps) => {
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    // Initialize from prop on first mount only
    useUiStore.getState().setSidebarCollapsed(defaultCollapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerClassName = clsx(
    styles.sidebar,
    isCollapsed && styles.collapsed,
    className
  );

  return (
    <aside
      className={containerClassName}
      style={{ width: isCollapsed ? collapsedWidth : expandedWidth, ...style }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <DashboardIcon />
          <div>Dashboard</div>
        </div>
      </div>

      <nav className={styles.content}>
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li
              key={item.id ?? index}
              className={clsx(styles.item, item.active && styles.active)}
            >
              <button
                type="button"
                className={styles.itemButton}
                onClick={item.onClick}
              >
                {item.icon ? (
                  <span className={styles.icon}>{item.icon}</span>
                ) : null}
                <span className={styles.label}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button
        type="button"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
        className={styles.toggle}
        onClick={toggleSidebar}
      >
        {isCollapsed ? "›" : "‹"}
      </button>
    </aside>
  );
};
