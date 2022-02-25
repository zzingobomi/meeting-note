import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Home from "routes/Home";
import Auth from "routes/Auth";
import Lobby from "routes/Lobby";
import CreateRoom from "routes/CreateRoom";
import MeetingRoom from "routes/MeetingRoom";
import Prepare from "routes/Prepare";
import Wrapup from "routes/Wrapup";
import NotFound from "routes/NotFound";
import { Fragment } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "atoms";
import Header from "./Header";

export const FragmentSupportingSwitch = ({ children }) => {
  const flattenedChildren = [];
  flatten(flattenedChildren, children);
  return React.createElement.apply(
    React,
    [Switch, null].concat(flattenedChildren)
  );
};

function flatten(target, children) {
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === Fragment) {
        flatten(target, child.props.children);
      } else {
        target.push(child);
      }
    }
  });
}

const AppRouter = () => {
  const loginedUser = useRecoilValue(userState);

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <FragmentSupportingSwitch>
        {loginedUser ? (
          <>
            <Route exact path="/">
              <Home></Home>
            </Route>
            <Route exact path="/login">
              <Redirect to="/lobby" />
            </Route>
            <Route exact path="/lobby">
              <>
                <Header></Header>
                <Lobby></Lobby>
              </>
            </Route>
            <Route exact path="/createroom">
              <>
                <Header></Header>
                <CreateRoom></CreateRoom>
              </>
            </Route>
            <Route exact path="/prepare">
              <>
                <Header></Header>
                <Prepare></Prepare>
              </>
            </Route>
            <Route exact path="/meetingroom">
              <>
                <Header></Header>
                <MeetingRoom></MeetingRoom>
              </>
            </Route>
            <Route exact path="/wrapup">
              <>
                <Header></Header>
                <Wrapup></Wrapup>
              </>
            </Route>
            <Route path="*" component={NotFound} />
          </>
        ) : (
          <>
            <Route exact path="/">
              <Home></Home>
            </Route>
            <Route exact path="/login">
              <>
                <Header></Header>
                <Auth></Auth>
              </>
            </Route>
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </>
        )}
      </FragmentSupportingSwitch>
    </BrowserRouter>
  );
};

export default AppRouter;
