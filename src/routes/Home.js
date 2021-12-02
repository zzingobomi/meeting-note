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
import "./Home.scss";

const Home = () => {
  const { t } = useTranslation(["page"]);

  return (
    <>
      <section className="home-header">
        <Container maxWidth="md">
          <div className="wrapper">
            <div className="wrapper-left">
              <div className="title">{t("page:home:header_title")}</div>
              <div className="desc-title">
                {t("page:home:header_desc_title")}
              </div>
              <div className="desc">{t("page:home:header_desc")}</div>
              <Link className="link" to="/login">
                <Button className="btn btn-login" variant="contained">
                  {t("page:home:login")}
                </Button>
              </Link>
            </div>
            <Header className="img-header" />
          </div>
        </Container>
        <div class="shape-divider-bottom">
          <HeaderShapeDividerBottom />
        </div>
      </section>
      <section className="section-1">
        <Container maxWidth="md">
          <div className="title">{t("page:home:introduce_title")}</div>
          <p>{t("page:home:introduce")}</p>
          <div className="video-wrapper">
            <Blob1 className="blob1" />
            <Blob2 className="blob2" />
            <YouTube className="introduce-video" videoId="9oLSZiVXUQ8" />
          </div>
          <Link className="link" to="/login">
            <Button className="btn btn-login" variant="contained">
              {t("page:home:login")}
            </Button>
          </Link>
        </Container>
      </section>
      <section className="section-2">
        <div class="top-tilt">
          <TopTilt />
        </div>
        <Container maxWidth="md">
          <div className="title">{t("page:home:skills_title")}</div>
          <p>{t("page:home:skills_desc")}</p>
          <Link className="link" to="/login">
            <Button className="btn btn-login" variant="contained">
              {t("page:home:login")}
            </Button>
          </Link>
        </Container>
        <div class="bottom-tilt">
          <BottomTilt />
        </div>
      </section>
      <section className="footer">
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
