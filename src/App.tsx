import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/sidebar";
import { TagsPreview } from "./pages/tags/tags";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router";
import { Dashboard } from "@src/pages/dashboard";
import { Expenses } from "@src/pages/expenses";
import { Reports } from "@src/pages/reports";
import { Settings } from "@src/pages/settings";
import { useUiStore } from "@src/store/ui";
import { Bounce, ToastContainer } from "react-toastify";
import { getOnboardingStatus } from "@src/lib/users";
import { TermsOfService } from "@src/pages/onboarding/terms-of-service";
import { CreateProfile } from "@src/pages/onboarding/create-profile";

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const EXPANDED_WIDTH = 180;
  const COLLAPSED_WIDTH = 64;
  const sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

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

  const sidebarItems = useMemo(
    () => [
      {
        label: "Dashboard",
        active: pathname === "/dashboard",
        onClick: () => navigate("/dashboard"),
      },
      {
        label: "Expenses",
        active: pathname === "/expenses",
        onClick: () => navigate("/expenses"),
      },
      {
        label: "Reports",
        active: pathname === "/reports",
        onClick: () => navigate("/reports"),
      },
      {
        label: "Tags",
        active: pathname === "/tags",
        onClick: () => navigate("/tags"),
      },
      {
        label: "Settings",
        active: pathname === "/settings",
        onClick: () => navigate("/settings"),
      },
    ],
    [pathname]
  );

  if (!isOnboardingChecked) {
    return <div className="min-h-screen bg-[#0B1410]" />; // Loading state
  }

  return (
    <div className="w-full h-full">
      {!isOnboarding && (
        <Sidebar
          defaultCollapsed={false}
          expandedWidth={EXPANDED_WIDTH}
          collapsedWidth={COLLAPSED_WIDTH}
          items={sidebarItems}
        />
      )}
      <div
        className={isOnboarding ? "" : "bg-green-950 h-full"}
        style={{
          marginLeft: isOnboarding ? 0 : sidebarWidth,
          width: isOnboarding ? "100%" : `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        <Routes>
          {isOnboarding ? (
            <>
              <Route path="/onboarding/tos" element={<TermsOfService />} />
              <Route
                path="/onboarding/create-profile"
                element={<CreateProfile />}
              />
              <Route path="*" element={<Navigate to="/onboarding/tos" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/tags" element={<TagsPreview />} />
              <Route path="/settings" element={<Settings />} />
            </>
          )}
        </Routes>
      </div>
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

export default App;
