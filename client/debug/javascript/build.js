(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
let run = require('./game');
run.run();


},{"./game":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9nYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IHJ1biA9IHJlcXVpcmUoJy4vZ2FtZScpO1xucnVuLnJ1bigpO1xuXG4iLCJsZXQgdGltZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGltZScpO1xubGV0IHF1ZXN0aW9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcmVzZW50cXVlc3Rpb24nKTtcbmxldCBzdGFydFRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0cGFnZScpO1xubGV0IGVuZFRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVuZHBhZ2UnKTtcbmxldCB0ZW1wbGF0ZUFsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hbHRlcm5hdGl2ZVRlbXBsYXRlJyk7XG5sZXQgdGVtcGxhdGVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnB1dFRlbXBsYXRlJyk7XG5sZXQgdWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVzdWx0Jyk7XG5sZXQgbmV4dFVSTDtcbmxldCBjdXJyZW50U2Vjb25kO1xubGV0IHNjb3JlIDtcbmxldCB1c2VybmFtZTtcbmxldCBpbnRlcnZhbDtcbmxldCBoaWdoc2NvcmU7XG5cbmZ1bmN0aW9uIHN0YXJ0R2FtZSgpeyAgLy8gc3RhcnQgZ2FtZSwgZGVmaW5pbmcgYnV0dG9ucyBhbmQgb3RoZXIgY2VudHJhbCBmdW5jdGlvbnMgYW5kIHZhcmlhYmVscy5cbiAgaGlnaHNjb3JlID0gZ2V0U3RvcmFnZSgpO1xuICBzdGFydFRlbXBsYXRlLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIGZhbHNlKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnRhdGlvbmNvbnRhaW5lcicpLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIHRydWUpO1xuICBzY29yZSA9IDA7XG5cbiAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbmRleGJ1dHRvbicpO1xuXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHsgLy8gc3RhcnRcbiAgICB1c2VybmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN1c2VybmFtZScpLnZhbHVlO1xuICAgIHN0YXJ0VGVtcGxhdGUuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnRhdGlvbmNvbnRhaW5lcicpLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIGZhbHNlKTtcbiAgICBxdWVzdGlvbkhhbmRsZXIoJ2h0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzEnKTtcbiAgfSk7XG5cbiAgbGV0IGVuZEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lbmRidXR0b24nKTtcblxuICBlbmRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7ICAvL2Z1bmN0aW9uIHdoZW4gZW5kaW5nIGdhbWUsIGNoYW5naW5nIGxheW91dCwgcmVzZXRpbmcgc2NvcmVzIGV0Y1xuICAgIHdoaWxlKHVsLmZpcnN0Q2hpbGQpe1xuICAgICAgdWwucmVtb3ZlQ2hpbGQodWwuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHNjb3JlID0gMDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NvcmUnKS50ZXh0Q29udGVudCA9IHNjb3JlO1xuICAgIGVuZFRlbXBsYXRlLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50YXRpb25jb250YWluZXInKS5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCBmYWxzZSk7XG4gICAgcXVlc3Rpb25IYW5kbGVyKCdodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xJylcbiAgfSk7XG5cbiAgbGV0IGJ1dHRvbkFuc3dlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b24nKTtcblxuICBidXR0b25BbnN3ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7IC8vQnV0dG9uIHRyaWdnZXIgc2VuZGluZyBhbnN3ZXIgdG8gdmVyaWZpY2F0aW9uXG4gICAgbGV0IGpzb25BbnN3ZXIgPSBKU09OLnN0cmluZ2lmeSh7XCJhbnN3ZXJcIjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJ2YWx1ZVwiXScpLnZhbHVlfSk7XG4gICAgdGVtcGxhdGVJbnB1dC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCB0cnVlKTtcbiAgICBwb3N0QW5zd2VyKG5leHRVUkwsIGpzb25BbnN3ZXIpO1xuICAgIGpzb25BbnN3ZXIudGV4dENvbnRlbnQgPSAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHF1ZXN0aW9uSGFuZGxlcihxdWVzdGlvblVSTCl7IC8vIHJlcXVlc3RpbmcgaHR0cHJlcXVlc3QgYW5kIGhhbmRsaW5nIHRoZSBpbmNvbWluZyBxdWVzdGlvblxuXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCl7XG5cbiAgICBpZiAoeGhyLnN0YXR1cyA+IDQwMCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yICcgKyBlcnJvcik7XG4gICAgfVxuXG4gICAgbGV0IGpzb25PYmplY3QgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgIHF1ZXN0aW9uRWxlbWVudC50ZXh0Q29udGVudCA9IGpzb25PYmplY3QucXVlc3Rpb247XG4gICAgYW5zd2VyUXVlc3Rpb24oanNvbk9iamVjdCk7XG4gICAgbmV4dFVSTCA9IGpzb25PYmplY3QubmV4dFVSTDtcbiAgfSk7XG5cbiAgeGhyLm9wZW4oJ0dFVCcsIHF1ZXN0aW9uVVJMKTtcbiAgeGhyLnNlbmQoKTtcbn1cblxuZnVuY3Rpb24gYW5zd2VyUXVlc3Rpb24oanNvbk9iamVjdCkgeyAgLy9GdW5jdGlvbiBnaXZpbmcgdHdvIGFsdGVybmF0aXZlIGRlcGVuZGluZyBvbiB3aGF0IGtpbmQgb2YgcXVlc3Rpb24gYXNrZWRcblxuICBhZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgcHJlc3NLZXkpO1xuXG4gIGlmKGpzb25PYmplY3QuYWx0ZXJuYXRpdmVzKSB7ICAvL0lmIGFuIGFsdGVybmF0aXZlIHF1ZXN0aW9uIC0+IExFVCBVUyBST0NLIEFORCBST0xMIVxuICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpOyAgIC8vQmV3YXJlIGRyYWdvbnMsIGRvbsK0dCBnbyB0aGVyZSEhXG4gICAgdGVtcGxhdGVBbHQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgZmFsc2UpO1xuICAgIHRleHRMaXN0LnRleHRDb250ZW50ID0gJyc7XG4gICAgbG9vcEF0bGVybmF0aXZlcyhqc29uT2JqZWN0KTtcbiAgICBzdGFydFRpbWVyKDIwKTtcbiAgfVxuXG4gIGVsc2UgeyAvLyBJZiBpbnB1dHF1ZXN0aW9uLCBsZXRzIGdvIVxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBwcmVzc0tleSk7XG4gICAgc3RhcnRUaW1lcigyMCk7XG4gICAgbmV4dFVSTCA9IGpzb25PYmplY3QubmV4dFVSTDtcbiAgICB0ZW1wbGF0ZUlucHV0LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVzc0tleShlKVxue1xuICBzd2l0Y2ggKGUua2V5Q29kZSkgeyAvL3N3aXRjaCBnaXZpbmcgd2l0aCB0cmlnZ2VyaW5nIGNhc2VzIGRlcGVuZGluZyBvbiB3aGF0IGtleSB1c2VyIHByZXNzZWRcbiAgICBjYXNlIDQ5OlxuICAgICAgdmFyIGFuc3dlciA9IEpTT04uc3RyaW5naWZ5KHtcImFuc3dlclwiOiBcImFsdDFcIn0pOyAgLy9ldmVyeSBjYXNlIHNlbmRpbmcgYW5zd2VyIHRvIHZlcmlmaWNhdGlvblxuICAgICAgcG9zdEFuc3dlcihuZXh0VVJMLCBhbnN3ZXIpO1xuICAgICAgdGVtcGxhdGVBbHQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDUwOlxuICAgICAgdmFyIGFuc3dlciA9IEpTT04uc3RyaW5naWZ5KHtcImFuc3dlclwiOiBcImFsdDJcIn0pO1xuICAgICAgcG9zdEFuc3dlcihuZXh0VVJMLCBhbnN3ZXIpO1xuICAgICAgdGVtcGxhdGVBbHQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDUxOlxuICAgICAgdmFyIGFuc3dlciA9IEpTT04uc3RyaW5naWZ5KHtcImFuc3dlclwiOiBcImFsdDNcIn0pO1xuICAgICAgcG9zdEFuc3dlcihuZXh0VVJMLCBhbnN3ZXIpO1xuICAgICAgdGVtcGxhdGVBbHQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDUyOlxuICAgICAgdmFyIGFuc3dlciA9IEpTT04uc3RyaW5naWZ5KHtcImFuc3dlclwiOiBcImFsdDRcIn0pO1xuICAgICAgcG9zdEFuc3dlcihuZXh0VVJMLCBhbnN3ZXIpO1xuICAgICAgdGVtcGxhdGVBbHQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mdW5jdGlvbiBwb3N0QW5zd2VyKG5leHRVUkwsIGpzb25BbnN3ZXIpeyAgLy9wb3N0aW5nIGFuc3dlciB0byB0aGUgc2VydmVyIGZvciB2ZXJpZmljYXRpb25cbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vcGVuKCdQT1NUJywgbmV4dFVSTCk7XG4gIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICB4aHIuc2VuZChqc29uQW5zd2VyKTtcbiAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG5cbiAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcblxuICAgIGlmICh4aHIuc3RhdHVzID4gNDAwKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgJyArIGVycm9yKTtcbiAgICB9XG4gICAgdmFyIGpzb25GaWxlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICBuZXh0VVJMID0ganNvbkZpbGUubmV4dFVSTDtcbiAgICBpZiAoanNvbkZpbGUubmV4dFVSTCkge1xuICAgICAgYW5zd2VyU3RhdHVzKGpzb25GaWxlLm1lc3NhZ2UsIG5leHRVUkwpXG4gICAgfVxuICAgIGVsc2V7IC8vIGlmIG5vIHVybCByZWNpdmVkIGdvIHRvIGVuZGdhbWVcbiAgICAgIGVuZEdhbWUoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhbnN3ZXJTdGF0dXMobWVzc2FnZSwgbmV4dFVSTCl7IC8vY29sbGVjdGluZyBhbnN3ZXIgYW5kIGRlY2lkZSBpZiB0aGUgZ2FtZSBlbmRzIG9yIGNvbnRpbnVlc1xuXG4gIGlmIChtZXNzYWdlID09PSBcIkNvcnJlY3QgYW5zd2VyIVwiKXtcbiAgICBzY29yZSArPSAgY3VycmVudFNlY29uZDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NvcmUnKS50ZXh0Q29udGVudCA9IHNjb3JlO1xuICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIHF1ZXN0aW9uSGFuZGxlcihuZXh0VVJMKSwgcmVmcmVzaCgpO1xuXG4gIH1cbiAgaWYgKG1lc3NhZ2UgPT09IFwiV3JvbmcgYW5zd2VyISA6KFwiKXtcbiAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICBlbmRHYW1lKCk7IHJlZnJlc2goKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmRHYW1lKCl7ICAvLyB3aGVuIGdhbWUgZW5kcyBwcmVzZW50SGlnaHNjb3JlLCBjaGFuZ2UgbG9vayBvZiBwYWdlIGFuZCBzYXZlIHRoZSByZXN1bHQgaW4gbG9jYWxzdG9yYWdlXG4gIHNldFN0b3JhZ2UodXNlcm5hbWUsIHNjb3JlKTtcbiAgcmVmcmVzaCgpO1xuICByZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgcHJlc3NLZXkpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudGF0aW9uY29udGFpbmVyJykuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gIGVuZFRlbXBsYXRlLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIGZhbHNlKTtcbiAgcHJlc2VudEhpZ2hzY29yZShoaWdoc2NvcmUpO1xufVxuXG5mdW5jdGlvbiBzdGFydFRpbWVyKHNldFNlY29uZHMpeyAgIC8vIGZ1bmN0aW9uIHRvIHN0YXJ0IHRoZSBpbnRlcnZhbCBjb3VudGluZyBmcm9tIDIwIC0gMFxuICBjdXJyZW50U2Vjb25kID0gc2V0U2Vjb25kcztcblxuICBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+e1xuXG4gICAgaWYoY3VycmVudFNlY29uZCA9PT0gMCkgeyAgLy8gaWYgY3VycmVudFNlY29uZCBpcyB6ZXJvIGVuZCB0aGUgZ2FtZVxuICAgICAgdGVtcGxhdGVJbnB1dC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCB0cnVlKVxuICAgICAgdGVtcGxhdGVBbHQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICB0ZXh0TGlzdC50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICBlbmRHYW1lKCk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBjdXJyZW50U2Vjb25kLS07XG4gICAgICB0aW1lRWxlbWVudC50ZXh0Q29udGVudCA9IGN1cnJlbnRTZWNvbmQ7XG4gICAgfVxuICB9LCAxMDAwKTtcbn1cblxuZnVuY3Rpb24gbG9vcEF0bGVybmF0aXZlcyhqc29uT2JqZWN0KXsgLy8gZnVuY3Rpb24gYXBwZW5kaW5nIGxpc3Qgb2YgcXVlc3Rpb25zXG5cbiAgbGV0IGkgPTE7XG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IHVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RleHRMaXN0JylcblxuICBPYmplY3Qua2V5cyhqc29uT2JqZWN0LmFsdGVybmF0aXZlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICBsZXQgdGV4dCA9ICdUYW5nZW50ICcgKyBpICsgJyA9ICcgKyBqc29uT2JqZWN0LmFsdGVybmF0aXZlc1trZXldO1xuICAgIHZhciBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBsaXN0LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICBpKys7XG5cbiAgfSk7XG5cbiAgdWwuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xufVxuXG5mdW5jdGlvbiByZWZyZXNoKCl7ICAvL3NpbXBsZSByZWZyZXNoaW5nIGFuc3dlcmluZyBpbnB1dCBzZXR0aW5nIHZhbHVlIHRvIGVtcHR5IHN0cmluZ1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYW5zd2VyJykudmFsdWUgPSAnJztcbiAgcXVlc3Rpb25FbGVtZW50LnRleHRDb250ZW50ID0gJyc7XG59XG5cbmZ1bmN0aW9uIHNldFN0b3JhZ2UodXNlcm5hbWUsIHNjb3JlKXtcblxuICBoaWdoc2NvcmUucHVzaChcbiAgICB7dXNlcm5hbWU6IHVzZXJuYW1lLCBzY29yZTogc2NvcmV9XG4gICk7XG5cbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hpZ2hzY29yZScsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuXG59XG5cbmZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7IC8vZ2V0IGpKU09OIGZyb20gbG9jYWxzdG9yYWdlXG4gIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdoaWdoc2NvcmUnKSkgfHwgW107XG59XG5cbmZ1bmN0aW9uIHByZXNlbnRIaWdoc2NvcmUoaGlnaHNjb3JlKSB7IC8vcHJlc2VudGluZyB0aGUgaGlnaHNjb3JlIGluIGEgbmljZSBsb29raW5nIHdheVxuICBoaWdoc2NvcmUuc29ydChmdW5jdGlvbihhLCBiKXsgIC8vIHNvcnRpbmcgaGlnaHNjb3JlIGRlc2NlbmRpbmcgb3JkZXJcbiAgICByZXR1cm4gYi5zY29yZSAtIGEuc2NvcmVcbiAgfSk7XG5cbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGlnaHNjb3JlLmxlbmd0aDsgaSsrKSB7ICAvL2l0ZXJhdGluZyB0aGUgbGlzdCB3aXRoIHRoZSBmaXZlIGJlc3QgcmVzdWx0c1xuXG4gICAgaWYgKGkgPCA1KSB7XG4gICAgICBsZXQgdGV4dCA9ICdVc2VyOiAnICsgaGlnaHNjb3JlW2ldLnVzZXJuYW1lICsgJyAgLi4uLi4uLi4gIFNjb3JlOiAnICsgaGlnaHNjb3JlW2ldLnNjb3JlO1xuICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgbGlzdC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICB9XG4gIH1cbnVsLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbn1cblxubW9kdWxlLmV4cG9ydHMucnVuID0gc3RhcnRHYW1lO1xuIl19
