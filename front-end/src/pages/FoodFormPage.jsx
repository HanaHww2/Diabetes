import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled, { css } from "styled-components";

import Top from "components/top";
import PageTitle from "components/pageTitle";
import Footer from "components/footer";
import ToggleView from "components/toggle";
import { getGl } from "components/gl";
import {
  postFood,
  getFoodWithId,
  getFoodWithIdByAdmin,
  updateFood,
  updateFoodByAdmin
} from "api/foodForm";

import { useNavigate, useLocation } from "react-router-dom";
import { FORM_ITEMS } from "const/formItems";
import "styles/main.css";

const ToggleButton = styled.div`
  &:hover {
    /* background: #63e6be; */
  }
  &:active {
    /* background: #20c997; */
    /* display: none; */
  }

  ${props =>
    props.open &&
    css`
      button {
        background: #ff6b6b;
        &:hover {
          background: #ff8787;
        }
        &:active {
          background: #fa5252;
        }
      }
    `}
`;

const SubmitButton = props => {
  return (
    <>
      <button
        type="submit"
        className={props.className}
        id={props.id}
        onClick={props.handleSubmitClick}
      >
        <span className="btn_text">{props.children}</span>
      </button>
    </>
  );
};

const FormContent = ({ fetchedData, isEditable, handleEditable }) => {
  const [inputs, setInputs] = useState({
    name: "", // == foodName, 반환 데이터 키가 name
    provider: "",
    entireWeight: "",
    calories: "",
    carbohydrate: "",
    protein: "",
    fat: "",
    fiber: "",
    intake: "",
    remains: "",
    gl: "",
    result: "",
    userId: "" // update by admin의 바디
  });

  /**
   * fetch된 데이터 존재하면, input 미리 채우기
   */
  useEffect(() => {
    // dataset 세팅
    if (fetchedData) {
      console.log(
        "🚀 ~ file: FoodFormTest.jsx:80 ~ useEffect ~ dataset:",
        fetchedData
      );
      setInputs({ ...fetchedData });
    }
  }, [fetchedData]);

  const navigate = useNavigate();
  /**
   * 저장 버튼 누르면, form에 입력되어 있는 데이터를 PUT 전송
   */
  const handleSubmitClickForUpdate = async () => {
    if (!onToggle()) return; //  toggle false면, API 요청 시도 X
    try {
      /**
       * admin의 업데이트에는 body에 userId가 추가됨
       * user의 업데이트에는 body에 userId = ''
       */
      console.log(String(inputs.userId), String(inputs.userId).length);
      if (!inputs.userId || String(inputs.userId).length === 0) {
        const updateRes = await updateFood(inputs);
        if (updateRes) {
          console.log("UPDATE by user");
          alert("변경 내용을 저장했습니다.") &&
            navigate("/foodForm/info/" + updateRes);
        }
      } else if (inputs.userId && String(inputs.userId).length != 0) {
        // Admin
        console.log("UPDATE by admin");
        const updateResByAdmin = await updateFoodByAdmin(inputs);
        if (updateResByAdmin) {
          alert("변경 내용을 저장했습니다.") &&
            navigate("/foodForm/info/" + updateResByAdmin, {
              state: inputs.userId
            });
        }
      }
    } catch (error) {
      alert("변경에 실패했습니다.");
      console.error("UPDATE FAIL", error);
    }
    /**
     * 저장 후 'foodForm/info/:id' 로 이동
     * navigate("/foodForm/info/" + foodId);
     * => 수정하기 버튼 && readonly 인지 확인
     */
  };

  /**
   * 저장 버튼 누르면, form에 입력되어 있는 데이터를 POST 전송
   */
  const handleSubmitClickForPost = async () => {
    if (!onToggle()) return; //  toggle false면, API 요청 시도 X
    try {
      const postRes = await postFood(inputs);
      if (postRes) {
        alert("저장했습니다.") && navigate("/foodForm/info/" + postRes);
      }
    } catch (error) {
      alert("저장에 실패했습니다.");
      console.error("POST FAIL");
    }
  };

  const onChangeInput = e => {
    const { name, value } = e.target;
    const nextInput = {
      ...inputs,
      [name]: value
    };
    setInputs(nextInput);
  };

  const onChangeInputForNum = e => {
    const getNumOnly = content => {
      let nums = content.replaceAll(/[^0-9.]*/g, "");
      if (nums.at(-1) === ".") {
        return parseInt(nums).toString() + ".";
      } else {
        nums = parseFloat(nums);
      }
      if (!nums) {
        nums = 0;
      }
      return nums;
    };

    const { name, value } = e.target;
    // if (isNaN(value)) {
    //   setMsg("숫자만 입력해주세요.");
    // }

    const nextInput = {
      ...inputs,
      [name]: getNumOnly(value)
    };
    setInputs(nextInput);
    // setToggleOpen(false);
    // 값이 변경되면 GL 결과를 다시 닫음
  };

  const formValidation = () => {
    if (inputs.entireWeight === 0 || inputs.intake === 0) {
      alert("총량과 섭취량은 0일 수 없습니다.");
      return false;
    } else if (inputs.entireWeight === "" || inputs.intake === "") {
      alert("총량과 섭취량을 입력해주세요.");
      return false;
    } else {
      return true;
    }
  };

  const [toggleOpen, setToggleOpen] = useState(false);
  const onToggle = () => {
    if (!formValidation()) {
      return false;
    }
    setToggleOpen(!toggleOpen);

    const [newgl, newResult] = getGl(inputs);
    const nextInput = {
      ...inputs,
      ["gl"]: newgl,
      ["result"]: newResult
    };
    console.log(
      "🚀 ~ file: foodForm.jsx:148 ~ onToggle ~ newgl",
      newgl,
      newResult
    );

    setInputs(nextInput);
    console.log(JSON.stringify(inputs));
    return true;
  };

  const onSubmit = e => {
    e.preventDefault(); // 폼전송시 리액트 상태 초기화 방지
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="main_wrap table_wrap">
          <table className="simple_font form-table">
            <tbody>
              {FORM_ITEMS.map((item, key) => {
                return (
                  <tr key={key}>
                    <td className="pad-right-10 space-between">
                      <span>{item.title}</span>
                      <span className="gray-txt">{item.unitsign}</span>
                    </td>
                    <td>
                      <div className="input_item" id="input_item_id">
                        <input
                          className="input_text"
                          name={item.label}
                          onChange={
                            item.types == "number"
                              ? onChangeInputForNum
                              : onChangeInput
                          }
                          value={inputs[item.label] ? inputs[item.label] : ""}
                          placeholder={item.placeholder && item.placeholder}
                          type={item.types && item.types}
                          disabled={!isEditable}
                        ></input>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
      <div className="btn_wrap">
        <ToggleView
          // onToggle={onToggle}
          open={toggleOpen}
          result={inputs.result}
          gl={inputs.gl}
        ></ToggleView>

        <ToggleButton
          // onClick={onToggle}
          open={toggleOpen}
        >
          <SubmitButton
            id="btn_result"
            handleSubmitClick={onToggle}
            className="btn_result"
          >
            결 과 보 기
          </SubmitButton>
        </ToggleButton>

        {isEditable ? (
          <SubmitButton
            handleSubmitClick={
              fetchedData
                ? handleSubmitClickForUpdate
                : handleSubmitClickForPost
            }
            className="btn_submit"
          >
            저 장 하 기
          </SubmitButton>
        ) : (
          <SubmitButton
            handleSubmitClick={handleEditable}
            className="btn_submit"
            id="edit-button"
          >
            수 정 하 기
          </SubmitButton>
        )}
      </div>
    </>
  );
};

const FoodFormTest = () => {
  const { foodId } = useParams();
  const { state: userId } = useLocation(); // Admin일 경우에만 userId
  console.log(userId, "<<< userId");

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [fetchedData, setFetchedData] = useState({});
  /* eslint-disable*/
  const handleEditable = bool => {
    // setIsReadOnly(!bool);
    setIsReadOnly(false);
  };

  useEffect(() => {
    /**
     * foodId : null     => new Form
     * foodId : not null => update Form
     */
    if (!foodId) {
      setIsReadOnly(false);
      return;
    }

    const getFoodResult = async () => {
      if (userId && userId.length != 0) {
        const getFoodResponse = await getFoodWithIdByAdmin(foodId);
        console.log(
          "🚀 ~ file: FoodFormPage.jsx:260 ~ getFoodResult ~ getFoodResponse:",
          getFoodResponse
        );
        if (getFoodResponse) {
          // userId 키가 있으면 ADMIN권한,
          // 수정 업데이트때 써야하므로 결과데이터에도 넣어줌
          getFoodResponse["userId"] = userId;
          console.log(
            "userId key추가되었는지",
            JSON.stringify(getFoodResponse)
          );

          setFetchedData(getFoodResponse);
          setIsReadOnly(true);
          console.log("food get api 성공");
        }
      } else {
        const getFoodResponse = await getFoodWithId(foodId);
        if (getFoodResponse) {
          setFetchedData(getFoodResponse);
          setIsReadOnly(true);
          console.log("food get api 성공");
        } else {
          console.log("food get api 실패");
        }
      }
    };

    // const fetchedDataRes = getFoodResult();
    // const fetchedDataRes = db.foodlist.result[0]; // TODO 제거
    // console.log(fetchedDataRes);
    getFoodResult();
  }, [foodId]);

  return (
    <>
      <div id="wrap" className="wrap">
        <Top />
        <PageTitle>{foodId ? "입력값 수정하기" : "새로  입력하기"}</PageTitle>

        <div id="info_container" className="container">
          <div id="info_inner" className="container_inner table_container">
            <FormContent
              fetchedData={
                Object.keys(fetchedData).length != 0 ? fetchedData : null
              }
              isEditable={isReadOnly ? false : true}
              handleEditable={handleEditable}
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};
export default FoodFormTest;
