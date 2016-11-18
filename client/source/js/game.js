let timeElement = document.querySelector('#time');
let questionElement = document.querySelector('#presentquestion');
let startTemplate = document.querySelector('.startpage');
let endTemplate = document.querySelector('.endpage');
let templateAlt = document.querySelector('.alternativeTemplate');
let templateInput = document.querySelector('.inputTemplate');
let ul = document.querySelector('#result');
let nextURL;
let currentSecond;
let score ;
let username;
let interval;
let highscore;

function startGame(){  // start game, defining buttons and other central functions and variabels.
  highscore = getStorage();
  startTemplate.classList.toggle('hidden', false);
  document.querySelector('.presentationcontainer').classList.toggle('hidden', true);
  score = 0;

  let button = document.querySelector('.indexbutton');

  button.addEventListener('click', function () { // start
    username = document.querySelector('#username').value;
    startTemplate.classList.toggle('hidden', true);
    document.querySelector('.presentationcontainer').classList.toggle('hidden', false);
    questionHandler('http://vhost3.lnu.se:20080/question/1');
  });

  let endButton = document.querySelector('.endbutton');

  endButton.addEventListener('click', function () {  //function when ending game, changing layout, reseting scores etc
    while(ul.firstChild){
      ul.removeChild(ul.firstChild);
    }
    score = 0;
    document.querySelector('#score').textContent = score;
    endTemplate.classList.toggle('hidden', true);
    document.querySelector('.presentationcontainer').classList.toggle('hidden', false);
    questionHandler('http://vhost3.lnu.se:20080/question/1')
  });

  let buttonAnswer = document.querySelector('.button');

  buttonAnswer.addEventListener('click', function () { //Button trigger sending answer to verification
    let jsonAnswer = JSON.stringify({"answer": document.querySelector('[name="value"]').value});
    templateInput.classList.toggle('hidden', true);
    postAnswer(nextURL, jsonAnswer);
    jsonAnswer.textContent = '';
  });
}

function questionHandler(questionURL){ // requesting httprequest and handling the incoming question

  let xhr = new XMLHttpRequest();

  xhr.addEventListener('load', function(){

    if (xhr.status > 400){
      throw new Error('Error ' + error);
    }

    let jsonObject = JSON.parse(xhr.responseText);
    questionElement.textContent = jsonObject.question;
    answerQuestion(jsonObject);
    nextURL = jsonObject.nextURL;
  });

  xhr.open('GET', questionURL);
  xhr.send();
}

function answerQuestion(jsonObject) {  //Function giving two alternative depending on what kind of question asked

  addEventListener('keydown', pressKey);

  if(jsonObject.alternatives) {  //If an alternative question -> LET US ROCK AND ROLL!
    clearInterval(interval);   //Beware dragons, don´t go there!!
    templateAlt.classList.toggle('hidden', false);
    textList.textContent = '';
    loopAtlernatives(jsonObject);
    startTimer(20);
  }

  else { // If inputquestion, lets go!
    removeEventListener('keydown', pressKey);
    startTimer(20);
    nextURL = jsonObject.nextURL;
    templateInput.classList.toggle('hidden', false);
  }
}

function pressKey(e)
{
  switch (e.keyCode) { //switch giving with triggering cases depending on what key user pressed
    case 49:
      var answer = JSON.stringify({"answer": "alt1"});  //every case sending answer to verification
      postAnswer(nextURL, answer);
      templateAlt.classList.toggle('hidden', true);
      break;
    case 50:
      var answer = JSON.stringify({"answer": "alt2"});
      postAnswer(nextURL, answer);
      templateAlt.classList.toggle('hidden', true);
      break;
    case 51:
      var answer = JSON.stringify({"answer": "alt3"});
      postAnswer(nextURL, answer);
      templateAlt.classList.toggle('hidden', true);
      break;
    case 52:
      var answer = JSON.stringify({"answer": "alt4"});
      postAnswer(nextURL, answer);
      templateAlt.classList.toggle('hidden', true);
      break;
  }
}

function postAnswer(nextURL, jsonAnswer){  //posting answer to the server for verification
  let xhr = new XMLHttpRequest();

  xhr.open('POST', nextURL);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(jsonAnswer);
  clearInterval(interval);

  xhr.addEventListener('load', function() {

    if (xhr.status > 400){
      throw new Error('Error ' + error);
    }
    var jsonFile = JSON.parse(xhr.responseText);
    nextURL = jsonFile.nextURL;
    if (jsonFile.nextURL) {
      answerStatus(jsonFile.message, nextURL)
    }
    else{ // if no url recived go to endgame
      endGame();
    }
  });
}

function answerStatus(message, nextURL){ //collecting answer and decide if the game ends or continues

  if (message === "Correct answer!"){
    score +=  currentSecond;
    document.querySelector('#score').textContent = score;
    clearInterval(interval);
    questionHandler(nextURL), refresh();

  }
  if (message === "Wrong answer! :("){
    clearInterval(interval);
    endGame(); refresh();
  }
}

function endGame(){  // when game ends presentHighscore, change look of page and save the result in localstorage
  setStorage(username, score);
  refresh();
  removeEventListener('keydown', pressKey);
  document.querySelector('.presentationcontainer').classList.toggle('hidden', true);
  endTemplate.classList.toggle('hidden', false);
  presentHighscore(highscore);
}

function startTimer(setSeconds){   // function to start the interval counting from 20 - 0
  currentSecond = setSeconds;

  interval = setInterval(() =>{

    if(currentSecond === 0) {  // if currentSecond is zero end the game
      templateInput.classList.toggle('hidden', true)
      templateAlt.classList.toggle('hidden', true);
      textList.textContent = '';
      clearInterval(interval);
      endGame();
    }
    else{
      currentSecond--;
      timeElement.textContent = currentSecond;
    }
  }, 1000);
}

function loopAtlernatives(jsonObject){ // function appending list of questions

  let i =1;
  let fragment = document.createDocumentFragment();
  let ul = document.querySelector('#textList')

  Object.keys(jsonObject.alternatives).forEach((key) => {

    let text = 'Tangent ' + i + ' = ' + jsonObject.alternatives[key];
    var list = document.createElement('li');
    list.textContent = text;
    fragment.appendChild(list);
    i++;

  });

  ul.appendChild(fragment);
}

function refresh(){  //simple refreshing answering input setting value to empty string
  document.querySelector('#answer').value = '';
  questionElement.textContent = '';
}

function setStorage(username, score){

  highscore.push(
    {username: username, score: score}
  );

  localStorage.setItem('highscore', JSON.stringify(highscore));

}

function getStorage() { //get jJSON from localstorage
  return JSON.parse(localStorage.getItem('highscore')) || [];
}

function presentHighscore(highscore) { //presenting the highscore in a nice looking way
  highscore.sort(function(a, b){  // sorting highscore descending order
    return b.score - a.score
  });

  let fragment = document.createDocumentFragment();

  for (let i = 0; i < highscore.length; i++) {  //iterating the list with the five best results

    if (i < 5) {
      let text = 'User: ' + highscore[i].username + '  ........  Score: ' + highscore[i].score;
      let list = document.createElement('li');
      list.textContent = text;
      fragment.appendChild(list);
    }
  }
ul.appendChild(fragment);
}

module.exports.run = startGame;
