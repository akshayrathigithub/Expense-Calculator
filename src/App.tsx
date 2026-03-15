import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router";
import {
  DashboardOutlined,
  WalletOutlined,
  BarChartOutlined,
  TagsOutlined,
  SettingOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  FireFilled,
} from "@ant-design/icons";
import { Button, ConfigProvider, Layout, Menu } from "antd";
import type { MenuProps } from "antd";

import { Dashboard } from "@src/pages/dashboard";
import { Expenses } from "@src/pages/expenses";
import { Reports } from "@src/pages/reports";
import { Settings } from "@src/pages/settings";
import { useUiStore } from "@src/store/ui";
import { Bounce, ToastContainer } from "react-toastify";
import { getOnboardingStatus } from "@src/lib/users";
import { TermsOfService } from "@src/pages/onboarding/terms-of-service";
import { CreateProfile } from "@src/pages/onboarding/create-profile";
import { TagsPreview } from "./pages/tags/tags";
import clsx from "clsx";

const { Content, Sider } = Layout;

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);

  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);


  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await getOnboardingStatus();
        if (!completed) {
          setIsOnboarding(true);
          if (!pathname.startsWith("/onboarding")) {
            navigate("/onboarding/tos");
          }
        } else {
          setIsOnboarding(false);
          await useUiStore.getState().initApp();
        }
      } catch (e) {
        console.error("Failed to check onboarding status", e);
      } finally {
        setIsOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, []);

  const items: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "/expenses",
      icon: <WalletOutlined />,
      label: "Expenses",
      onClick: () => navigate("/expenses"),
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Reports",
      onClick: () => navigate("/reports"),
    },
    {
      key: "/tags",
      icon: <TagsOutlined />,
      label: "Tags",
      onClick: () => navigate("/tags"),
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  if (!isOnboardingChecked) {
    return <div className="min-h-screen bg-[#0B1410]" />; // Loading state
  }

  // Onboarding Layout
  if (isOnboarding) {
    return (
      <div className="w-full h-full">
        <Routes>
          <Route path="/onboarding/tos" element={<TermsOfService />} />
          <Route path="/onboarding/create-profile" element={<CreateProfile />} />
          <Route path="*" element={<Navigate to="/onboarding/tos" />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop
          rtl={false}
          theme="dark"
          transition={Bounce}
        />
      </div>
    );
  }

  // Main Layout
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#13ec5b",
          colorPrimaryHover: "#4ade80",
          colorPrimaryActive: "#16a34a",
        },
        components: {
          Menu: {
            itemBg: "#111813",
            itemSelectedBg: "#16a34a",
            itemSelectedColor: "#13ec5b",
            itemHoverBg: "#111813",
            itemColor: "#86efac",
          },
          Layout: {
            siderBg: "#0b1410",
            bodyBg: "#102216",
          },
          Table: {
            headerBg: "transparent",
            headerColor: "#9db9a6",
            headerSplitColor: "transparent",
            bodySortBg: "transparent",
            rowHoverBg: "rgba(19, 236, 91, 0.05)",
            borderColor: "rgba(59, 84, 67, 0.3)",
            colorBgContainer: "transparent",
            colorText: "#f0fdf4",
            footerBg: "transparent",
            cellPaddingBlock: 20,
          },
        },
      }}
    >
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Sider
          collapsible
          collapsed={isCollapsed}
          trigger={null}
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed) => {
            setSidebarCollapsed(collapsed);
          }}
          className="relative"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div className={clsx("flex items-center h-s-12", {
            "center w-100": isCollapsed,
            "pl-4": !isCollapsed
          })} >
            <FireFilled style={{ fontSize: "24px" }} className="text-green-500" />
            {!isCollapsed && <p className="text-2xl text-white-50 ml-2">Expenso</p>}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={items}
          />
          <Button
            type="text"
            icon={isCollapsed ? <RightCircleOutlined style={{ fontSize: "24px", color: "white" }} /> : <LeftCircleOutlined style={{ fontSize: "24px", color: "white" }} />}
            onClick={() => setSidebarCollapsed(!isCollapsed)}
            style={{ right: -13, bottom: 100 }}
            className="absolute"
          />
        </Sider>
        <Layout style={{ overflowY: "auto" }}>
          <Content>
            <div
              style={{
                padding: 24,
                minHeight: 360,
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/tags" element={<TagsPreview />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </Content>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop
          rtl={false}
          theme="dark"
          transition={Bounce}
        />
      </Layout>
    </ConfigProvider>
  );
}

export default App;
