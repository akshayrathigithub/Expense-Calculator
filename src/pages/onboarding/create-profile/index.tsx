import { useState } from "react";
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { useUiStore } from "@src/store/ui";
import { setOnboardingStatus } from "@src/lib/users";
import styles from "./create-profile.module.scss";

export function CreateProfile() {
  const addUser = useUiStore((state) => state.addUser);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await addUser(name);
      await setOnboardingStatus(true);
      // Force a reload to trigger the main app view and re-check DB
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            ExpenseCalc
          </div>
        </div>

        <h1 className={styles.title}>Welcome! Create Your Profile</h1>
        <p className={styles.subtitle}>
          Let's start by giving your profile a name.
        </p>

        <div className={styles.form}>
          <div>
            <label className={styles.label}>Profile Name</label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className={styles.input}
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!name.trim() || loading}
            className={styles.button}
          >
            {loading ? "Creating..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
