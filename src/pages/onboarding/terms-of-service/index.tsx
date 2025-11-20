import { Button } from "@src/components/ui/button";
import { useNavigate } from "react-router";
import styles from "./terms-of-service.module.scss";

export function TermsOfService() {
  const navigate = useNavigate();

  const handleAccept = () => {
    // We don't set the DB flag here yet, we wait until profile creation is done.
    // Or we can set a temporary flag if we had one, but for now just navigate.
    navigate("/onboarding/create-profile");
  };

  const handleDecline = () => {
    // In a real app, this might exit or show an error.
    alert("You must accept the terms to continue.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Review Our Terms of Service</h1>
        <p className={styles.subtitle}>
          Please read and accept the following terms to continue setting up your
          account.
        </p>

        <div className={styles.contentArea}>
          <section>
            <h2 className={styles.sectionTitle}>1. Introduction</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>2. Your Account</h2>
            <p>
              Phasellus egestas tellus rutrum tellus pellentesque eu. Mattis
              enim ut tellus elementum sagittis vitae et. Amet commodo nulla
              facilisi nullam vehicula ipsum a arcu cursus. Sed vulputate mi sit
              amet mauris commodo quis imperdiet. Eget nullam non nisi est sit
              amet facilisis magna. Viverra nibh cras pulvinar mattis nunc sed
              blandit libero.
            </p>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>3. Content and Data</h2>
            <p>
              Quis commodo odio aenean sed adipiscing diam donec adipiscing. Leo
              vel fringilla est ullamcorper eget nulla facilisi. Et netus et
              malesuada fames ac turpis egestas integer. Amet purus gravida quis
              blandit turpis cursus in hac. Justo donec enim diam vulputate ut
              pharetra sit amet.
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <Button
            variant="secondary"
            onClick={handleDecline}
            className={styles.declineButton}
          >
            Decline
          </Button>
          <Button onClick={handleAccept} className={styles.acceptButton}>
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
