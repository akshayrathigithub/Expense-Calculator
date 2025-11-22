import { useState } from "react";
import { useUiStore } from "@src/store/ui";
import styles from "./settings.module.scss";
import clsx from "clsx";
import { toast } from "react-toastify";

export function Settings() {
  const { selectUser, users } = useUiStore();

  const handleActivateProfile = async (userId: string) => {
    try {
      await selectUser(userId);
      toast.success("Profile activated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate profile");
    }
  };

  const handleDeleteProfile = (userId: string) => {
    // Placeholder for delete functionality
    toast.info(`Delete profile ${userId} (Not implemented yet)`);
  };

  const handleExport = () => {
    toast.info("Exporting data... (Not implemented yet)");
  };

  const handleImport = () => {
    toast.info("Importing data... (Not implemented yet)");
  };

  const renderProfiles = () => {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h3>Manage Profiles</h3>
          <button
            className={clsx(styles.btn, styles.primary)}
            onClick={() => toast.info("Create Profile clicked")}
          >
            + Create New Profile
          </button>
        </div>

        <div className={styles.profileGrid}>
          {users.list.map((user) => (
            <div
              key={user.id}
              className={clsx(styles.profileCard, user.active && styles.active)}
            >
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{user.displayName}</span>
                  {user.active && <span className={styles.badge}>Active</span>}
                </div>
                <span className={styles.type}>
                  {user.active ? "Default Profile" : "Profile"}
                </span>

                <div className={styles.actions}>
                  {!user.active && (
                    <button
                      className={clsx(styles.btn, styles.secondary)}
                      onClick={() => handleActivateProfile(user.id)}
                    >
                      Activate
                    </button>
                  )}
                  <button
                    className={clsx(styles.btn, styles.danger)}
                    onClick={() => handleDeleteProfile(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div
                className={clsx(
                  styles.avatar,
                  user.active ? styles.green : styles.blue
                )}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataManagement = () => {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h3>Database Management</h3>
        </div>

        <div className={styles.dbGrid}>
          <div className={styles.dbCard}>
            <h4>Export Backup</h4>
            <p>
              Create a downloadable backup file of the current profile's data.
              Keep this file in a safe place.
            </p>
            <button
              className={clsx(styles.btn, styles.outline)}
              onClick={handleExport}
            >
              Export Data
            </button>
          </div>

          <div className={styles.dbCard}>
            <h4>Import Backup</h4>
            <p>
              <span className={styles.warning}>Warning:</span> Importing a
              backup will overwrite all existing data for the current profile.
            </p>
            <button
              className={clsx(styles.btn, styles.outline)}
              onClick={handleImport}
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {renderProfiles()}
        {renderDataManagement()}
      </div>
    </div>
  );
}
