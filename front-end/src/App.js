import React from "react";
import AppRouter from "components/router";
import "styles/main.css";
import {Link} from "react-router-dom";
import styled from "styled-components";

function App() {
  // width: "40%",
  // margin: "0 auto",
  const Main = styled.div`
    background: var(--white-color);
    /* #main-card { */
    /* } */
  `;

  return (
    <div>
      <Main>
        <AppRouter />
      </Main>

      <div className="temp">
        <li>
          <Link to="/login">로그인페이지로</Link>
        </li>
        <li>
          <Link to="/foodForm">입력페이지로</Link>
        </li>
        <li>
          <Link to="/mylist">입력목록 페이지로</Link>
        </li>
        <li>
          <Link to="/adminUserList">(어드민) 유저목록 페이지로</Link>
        </li>
      </div>
    </div>
  );
}

export default App;
