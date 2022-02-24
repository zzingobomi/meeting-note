import React from "react";
import styles from "./NotFound.module.scss";

const NotFound = () => {
  return (
    <div className={styles.not_found}>
      <div className={styles.error_code}>404</div>
      <div className={styles.desc}>Not Found</div>
    </div>
  );
};

export default NotFound;
