import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import YouTube from "react-youtube";
import { Button, Container } from "@mui/material";
import { ReactComponent as Header } from "assets/home/header.svg";
import { ReactComponent as HeaderShapeDividerBottom } from "assets/home/header-shape-divider-bottom.svg";
import { ReactComponent as TopTilt } from "assets/home/section2-top-tilt.svg";
import { ReactComponent as BottomTilt } from "assets/home/section2-bottom-tilt.svg";
import { ReactComponent as Blob1 } from "assets/home/section1-blob-1.svg";
import { ReactComponent as Blob2 } from "assets/home/section1-blob-2.svg";
import usePageTracking from "usePageTracking";
import styles from "./Home.module.scss";

const Home = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);

  return (
    <>
      <section className={styles.home_header}>
        <Container maxWidth="md">
          <div className={styles.wrapper}>
            <div className={styles.wrapper_left}>
              <div className={styles.title}>{t("page:home:header_title")}</div>
              <div className={styles.desc_title}>
                {t("page:home:header_desc_title")}
              </div>
              <div className={styles.desc}>{t("page:home:header_desc")}</div>
              <Link className={styles.link} to="/login">
                <Button
                  className={`${styles.btn} ${styles.btn_login}`}
                  variant="contained"
                >
                  {t("page:home:login")}
                </Button>
              </Link>
            </div>
            <Header className={styles.img_header} />
          </div>
        </Container>
        <div className={styles.shape_divider_bottom}>
          <HeaderShapeDividerBottom />
        </div>
      </section>
      <section className={styles.section_1}>
        <Container maxWidth="md">
          <div className={styles.title}>{t("page:home:introduce_title")}</div>
          <p>{t("page:home:introduce")}</p>
          <div className={styles.video_wrapper}>
            <Blob1 className={styles.blob1} />
            <Blob2 className={styles.blob2} />
            <YouTube className={styles.introduce_video} videoId="9oLSZiVXUQ8" />
          </div>
          <Link className={styles.link} to="/login">
            <Button
              className={`${styles.btn} ${styles.btn_login}`}
              variant="contained"
            >
              {t("page:home:login")}
            </Button>
          </Link>
        </Container>
      </section>
      <section className={styles.section_2}>
        <div className={styles.top_tilt}>
          <TopTilt />
        </div>
        <Container maxWidth="md">
          <div className={styles.title}>{t("page:home:skills_title")}</div>
          <p>{t("page:home:skills_desc")}</p>
          <Link className={styles.link} to="/login">
            <Button
              className={`${styles.btn} ${styles.btn_login}`}
              variant="contained"
            >
              {t("page:home:login")}
            </Button>
          </Link>
        </Container>
        <div className={styles.bottom_tilt}>
          <BottomTilt />
        </div>
      </section>
      <section className={styles.footer}>
        <Container maxWidth="md">
          <div>
            <a href="https://github.com/zzingobomi/meeting-note">
              {t("page:home:footer:github")}
            </a>
          </div>
          <div>
            <a href="https://kr.freepik.com/vectors/abstract">
              {t("page:home:footer:license")}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Home;
