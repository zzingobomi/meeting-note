import { Container, Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { authService } from "fbase";
import { useTranslation } from "react-i18next";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useHistory } from "react-router";
import { useRecoilValue } from "recoil";
import { userState } from "atoms";
import styles from "./Header.module.scss";

const Header = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const loginedUser = useRecoilValue(userState);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogOutClick = () => {
    handleClose();
    authService.signOut();
  };

  const onGotoHomeClick = () => {
    history.push("/");
  };

  return (
    <header>
      <Container maxWidth="lg">
        <div className={styles.header_container}>
          <span className={styles.logo} onClick={onGotoHomeClick}>
            Meeting Note
          </span>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={onLogOutClick}>
              {t("page:common:logout")}
            </MenuItem>
          </Menu>

          {loginedUser ? (
            <>
              {loginedUser.photoURL ? (
                <div className={styles.user_info}>
                  <span>{loginedUser.displayName}</span>
                  <img
                    src={loginedUser.photoURL}
                    aria-controls="basic-menu"
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                  />
                </div>
              ) : (
                <AccountCircleIcon
                  className={styles.anony}
                  aria-controls="basic-menu"
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                />
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;
