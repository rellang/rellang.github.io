/*
 * Name: Jungeun Kim
 * Date: May 8, 2026
 * Section: IAB 6068
 *
 * This is the JS file for interaction.
 * Dog API is using for this project.
 * For this, I got dog's picture and variety name.
 */

(function() {
  "use strict";

  /*Module-global variables*/
  let varietyList = [];
  let difficulty;
  let timeLeft = -1;
  let timerId = null;
  let hintCnt = 3;
  let score = 0;
  let combo = 0;

  window.addEventListener("load", init);

  async function init() {
    const startBtn = id("startBtn");
    startBtn.disabled = true;
    startBtn.textContent = "데이터 로딩 중...";

    try {
      const url = "https://dog.ceo/api/breeds/list/all";
      const data = await fetchData(url);
      const varieties = data.message;

      makeVarietyList(varieties);

      startBtn.disabled = false;
      startBtn.textContent = "시작하기";

      startBtn.addEventListener("click", difficultyScreen);

      const difficultyBtns = qsa(".difficulty");
      difficultyBtns.forEach(diffBtn => {
        diffBtn.addEventListener("click", selectDifficulty);
      });

      id("hintBtn").addEventListener("click", showHint);

      const quizes = qsa(".quiz");
      quizes.forEach(quiz => {
        quiz.addEventListener("click", check);
      });

      id("restartBtn").addEventListener("click", restart);
    }  catch (err) {
      startBtn.textContent = "로딩 실패 (새로고침 하세요)";
      handleError(err);
    }
  }

  /**
   * Show difficulty selection window
   * @param {Event} event - click game start
   */
  function difficultyScreen(event) {
    const diffcontainer = id("difficulty-container");
    diffcontainer.classList.remove("hidden");
  }

  /**
   * set the difficulty of the game
   * @param {Event} event - click difficulty
   */
  async function selectDifficulty(event) {
    const selectedDiff = event.target.id;
    difficulty = selectedDiff;

    await makeTable()
  }

  /**
   * setting before the game is started
   */
  async function makeTable() {
    const settings = difficultySetting();

    const board = id("card-container");
    board.innerHTML = "<p>강아지들을 불러오는 중...</p>"; // 로딩 메시지

    const numArr = getRandNumArr(settings["pairs"], varietyList.length);

    let imgArr = await getRandImg(numArr);

    if (!imgArr || imgArr.length === 0) {
      alert("이미지를 불러오지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    suffleCard(imgArr);

    board.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < imgArr.length; i++) {
      const card = createCard(imgArr[i]);
      fragment.appendChild(card);
    }

    id("explanation").classList.add("hide");
    id("start").classList.add("hide");
    id("game-container").classList.remove("hidden");
    board.appendChild(fragment);

    startGame();
  }

  /**
   * start the game
   */
  function startGame(imgArr) {
    threeSec();
  }

  /**
   * preview for 3 seconds
   */
  function threeSec() {
    const allCards = qsa(".card");
    allCards.forEach(card => {
      card.classList.add("flipped");
    });

    setTimeout(() => {
      allCards.forEach(card => {
        card.classList.remove("flipped");
      });

      startTimer();
    }, 3000);
  }

  /**
   * game timer
   */
  function startTimer() {
    if (timeLeft === -1) {
      const setting = difficultySetting();
      timeLeft = setting["time"];
    }

    const currTime = id("time");

    timerId = setInterval(() => {
      timeLeft--;
      currTime.textContent = `남은시간: ${timeLeft}`;

      if (timeLeft <= 0 || qsa(".card").length === qsa(".flipped").length) {
        clearInterval(timerId);
        timerId = null;
        resultScreen();
      }
    }, 1000);
  }

  /**
   * show result
   */
  function resultScreen() {
    id("game-container").classList.add("no-click");
    id("hint-container").classList.add("hide");
    id("result-container").classList.remove("hide");
    if (timeLeft < 0) {
      timeLeft = 0;
    }
    score += (timeLeft * 10);
    id("finalScore").textContent = `최종 점수: ${score}점`;
  }

  function restart() {
    id("explanation").classList.remove("hide");
    id("difficulty-container").classList.add("hidden");
    id("start").classList.remove("hide");
    id("game-container").classList.add("hidden");
    id("result-container").classList.add("hide");
    id("game-container").classList.remove("no-click");

    timeLeft = -1;
    timerId = null;
    score = 0;
    combo = 0;
    hintCnt = 3;

    id("curr-score").textContent = "점수: 0";
    id("curr-combo").textContent = "콤보: 0";
    id("time").textContent = "남은시간: 0";
  }

  /**
   * generate OX quiz for hint
   * @returns - nothing
   */
  function showHint() {
    if (hintCnt <= 0) return;
    if (qsa(".first").length === 0) return;
    hintCnt--;

    id("hint-container").classList.remove("hide");
    id("game-container").classList.add("no-click");

    clearInterval(timerId);
    timerId = null;

    const quizCard = qsa(".first")[0];
    const quizUrl = quizCard.querySelector("img");
    const image = quizUrl.src;
    const parts = image.split("/");

    const variety = findName(parts);
    const quizValue = randomize(variety);

    const hint = id("hint-container");
    const quizImg = hint.querySelector("img");
    quizImg.src = image;

    id("quiz").textContent = `이것은 ${quizValue} 인가요?`;

    if (quiz === variety) {
      id("O").classList.add("correct");
      id("X").classList.remove("correct");
    } else {
      id("X").classList.add("correct");
      id("O").classList.remove("correct");
    }
  }

  /**
   * judge the answer about quiz
   */
  function check(event) {
    const selectedBtn = event.target;

    if (selectedBtn.classList.contains("correct")) {
      getHint();
    } else {
      loseHint();
    }
    qsa(".correct")[0].classList.remove("correct");

    qsa(".first")[0].classList.remove("first");

    id("game-container").classList.remove("no-click");
    id("hint-container").classList.add("hide");
    startTimer();
  }

  /**
   * find the card having same src
   */
  function getHint() {
    const first = qsa(".first")[0];
    const src = first.querySelector("img").src;

    const otherCards = qsa(".card:not(.first)");

    otherCards.forEach(card => {
      if (card.querySelector("img").src === src) {
        card.classList.add("flipped");
      }
    })
  }

  function loseHint() {
    qsa(".first")[0].classList.remove("flipped");
    timeLeft = (timeLeft - 5 < 0) ? 0 : timeLeft - 5;
  }

  /**
   * create a fifty-fifty probability
   * @param {string} answer - an exact name
   * @returns - correct or incorrect name
   */
  function randomize(answer) {
    const randNum = Math.floor(Math.random() * varietyList.length);
    const quizArr = [answer, varietyList[randNum]];

    const result = Math.floor(Math.random() * 2);
    const quiz = quizArr[result]

    return quiz;
  }

  /**
   * restore name from formattedName
   * @param {string[]} parts - an array including name parts
   * @returns - variety name
   */
  function findName(parts) {
    let name
    let temp = parts[4];
    if (temp.includes("-")) {
      const part = temp.split("-");
      name = `${part[1]} ${part[0]}`;
    } else{
      name = temp;
    }
    return name;
  }

  /**
   * when you click the card, it is flipped
   */
  function flipCard() {
    if (this.classList.contains("flipped")) return;

    this.classList.add("flipped");

    if(qsa(".first").length === 0) {
      this.classList.add("first");
      return;
    }

    this.classList.add("second");
    match()
  }

  /**
   * determine if the two cards match
   */
  function match() {
    let condition = qsa(".first")[0].querySelector("img").src
    === qsa(".second")[0].querySelector("img").src;

    if (condition) {
      scoring();
    } else {
      dismatch(qsa(".first")[0], qsa(".second")[0])
    }

    qsa(".first")[0].classList.remove("first");
    qsa(".second")[0].classList.remove("second");
  }

  /**
   * calculate current combo and score
   */
  function scoring() {
    combo++;
    const bonus = Math.floor(combo / 5) * 5;

    score = score + 20 + bonus;

    id("curr-combo").textContent = "콤보: " + combo;
    id("curr-score").textContent = "점수: " + score;
  }

  /**
   * initialize first, second card, and combo
   * @param {query} first - to remove its flipped class
   * @param {query} second - to remove its flipped class
   */
  function dismatch(first, second) {
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
    }, 1000)

    timeLeft -= 2;
    combo = 0;
    id("curr-combo").textContent = "콤보: " + combo;
  }

  /**
   * create card by using template
   * @param {string} imgUrl - dog image url for the front of the card
   * @returns - new card
   */
  function createCard(imgUrl) {
    const template = id("card-template");
    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".card");
    const img = card.querySelector("img");

    img.src = imgUrl;
    img.alt = "random dog card";
    card.addEventListener("click", flipCard);

    return card;
  }

  /**
   * return an array containing non-overlapping numbers
   * @param {number} count - desired array length
   * @param {number} max - maximum number range
   * @returns - array with numbers randomly picked
   */
  function getRandNumArr(count, max) {
    const numSet = new Set();

    while (numSet.size < count) {
      const randNum = Math.floor(Math.random() * max);
      numSet.add(randNum);
    }

    return Array.from(numSet);
  }

  /**
   * get sources about dog images
   * @param {number[]} numArr - picked indexes of varietyList
   * @returns - an array about image source url
   */
  async function getRandImg(numArr) {
    let imgArr = [];
    for (let i = 0; i < numArr.length; i++) {
      const variety = varietyList[numArr[i]]
      const formattedName = formatNamePath(variety);
      const url = `https://dog.ceo/api/breed/${formattedName}/images/random`;

      const img = await fetchData(url);
      imgArr.push(img.message);
      imgArr.push(img.message);
    }
    return imgArr;
  }

  /**
   * suffle the indexes of image array
   * @param {string[]} imgArr - an array of image urls
   */
  function suffleCard(imgArr) {
    for (let i = imgArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imgArr[i], imgArr[j]] = [imgArr[j], imgArr[i]];
    }
  }

  /**
   * convert variety name for fetch
   * @param {string} name - variety name
   * @returns - converted variety name
   */
  function formatNamePath(name) {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[1]}/${parts[0]}`;
    }
    return name;
  }

  /**
   * return settings according to difficulty
   * @returns - settings dictionary
   */
  function difficultySetting() {
    const settings = {
      "easy": {"pairs": 4, "time": 20, "flip": 24},
      "normal": {"pairs": 8, "time": 40, "flip": 36},
      "hard": {"pairs": 12, "time": 60, "flip": 48}
    };

    if (difficulty === "hard") {
      id("card-container").style.setProperty("--grid-cols", 6);
    } else {
      id("card-container").style.setProperty("--grid-cols", 4);
    }
    return settings[difficulty];
  }

  /**
   * Make a list with subvariants
   * @param {string{}} varieties - variety dictionary
   * distinguished between the original and subvariants
   */
  function makeVarietyList(varieties) {
    for (let variety in varieties) {
      if (varieties[variety].length === 0) {
        varietyList.push(variety);
      } else {
        for (let sub in varieties[variety]) {
          varietyList.push(`${varieties[variety][sub]} ${variety}`);
        }
      }
    }
  }

  /*About Fetching*/
  /**
   * return the result for the API url inputted
   * @param {string} url - API url
   * @returns - the object containing information about the API
   */
  async function fetchData(url) {
    let result;

    try {
      const resp = await fetch(url)
      await statusCheck(resp);
      result = await resp.json();

    } catch (error) {
      handleError(error);
    }
    return result;
  }

  /**
   * Check API response
   * @param {Response} response - response object requested fetch
   * @returns {Response} - response is success
   * @throws {Error} - response is not success
   */
  async function statusCheck(response) {
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
  }

  /**
   * Alert fetching error
   * @param {Error} error - error object
   */
  function handleError(error) {
    console.error("fetch error: ", error)
  }

  /*Helper Functions*/
  /**
   * return the element which has the id
   * @param {string} name - element id
   * @returns {object} - DOM object associated with id
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * return an array of elements which match the given CSS selector
   * @param {string} query - CSS query selector
   * @returns {object} - first DOM object matching the query
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();