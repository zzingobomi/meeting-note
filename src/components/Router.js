import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Auth from "routes/Auth";
import Lobby from "routes/Lobby";
import MeetingRoom from "routes/MeetingRoom";
import Prepare from "routes/Prepare";
import Wrapup from "routes/Wrapup";
import NotFound from "routes/NotFound";
import { useSelector } from "react-redux";
import CreateRoom from "routes/CreateRoom";
import { authService } from "../fbase";

// TODO: 새로고침에서 not found 가 뜨네..
/*
import { Fragment } from "react";

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
*/

const AppRouter = () => {
  const loginedUser = useSelector((store) => store.loginedUser); // 이거 때문에 2번 호출되는거 같긴 한데.. authstate 가 바뀌니까 맞는건가?
  console.log("AppRouter");

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Switch>
        {loginedUser ? (
          <>
            <Route exact path="/">
              <Redirect to="/lobby" />
            </Route>
            <Route exact path="/lobby">
              <Lobby></Lobby>
            </Route>
            <Route exact path="/createroom">
              <CreateRoom></CreateRoom>
            </Route>
            <Route exact path="/prepare">
              <Prepare></Prepare>
            </Route>
            <Route exact path="/meetingroom">
              <MeetingRoom></MeetingRoom>
            </Route>
            <Route exact path="/wrapup">
              <Wrapup></Wrapup>
            </Route>
          </>
        ) : (
          <>
            <Route exact path="/">
              <Auth></Auth>
            </Route>
            <Route path="/">
              <Redirect to="/" />
            </Route>
          </>
        )}
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
