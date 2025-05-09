var token = "INSERT TOKEN";
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = "INSERT WEBAPP URL";
var sheetId = "INSERT SPREADSHEET ID";
var ss = SpreadsheetApp.openById(sheetId);
var gamesheet = ss.getSheetByName("USERS");
var qsheet = ss.getSheetByName("2tf");
var msheet = ss.getSheetByName("4mcq");

function getMe() {
  var url = telegramUrl + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendMessage(id, text, keyboard) {
  var data = {
    method : "post",
    payload: {
      method: "sendMessage",
      chat_id: String(id),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyboard)
    }
  };
  var url = "https://api.telegram.org/bot" + token + "/";
  var response = UrlFetchApp.fetch(url, data);
  Logger.log(response.getContentText());
}

function editMessage(chat_id, message_id, text, keyboard) {
  var data = {
    method: "post",
    payload: {
      method: "editMessageText",
      chat_id: String(chat_id),
      message_id: message_id.toString(),
      text: text,
      reply_markup: JSON.stringify(keyboard)
    }
  };
  UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data);
}

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendText(chat_id, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + chat_id + "&text=" + text + "&parse_mode=Markdown";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hi there");
}

function getValidRow(chat_id) {
  var users = gamesheet.getRange(1, 1, gamesheet.getLastRow(), 1).getValues();
  for (i=0; i<users.length; i++) {
    if (users[i][0] == chat_id) return String(i+1);
  }
  return -1;
}

function sendState(chat_id, row) { // ROW IS STRING
  var msg = "";
  msg += "Question: " + gamesheet.getRange('D' + row).getValue();
  msg += "%0A%0A";
  msg += "Options:%0A";
  msg += "/a: " + gamesheet.getRange('F' + row).getValue() + " (current points: " + gamesheet.getRange('J' + row).getValue() + ")%0A";
  msg += "/b: " + gamesheet.getRange('G' + row).getValue()  + " (current points: " + gamesheet.getRange('K' + row).getValue() + ")%0A";
  msg += "/c: " + gamesheet.getRange('H' + row).getValue() + " (current points: " + gamesheet.getRange('L' + row).getValue() + ")%0A";
  msg += "/d: " + gamesheet.getRange('I' + row).getValue() + " (current points: " + gamesheet.getRange('M' + row).getValue() + ")%0A";
  msg += "%0APoints remaining: " + gamesheet.getRange('C' + row).getValue();
  msg += "%0A%0A/submit once you're done!";
  sendText(chat_id, msg);
}

function rollQuestion(row, chat_id, name) {
  var s = Math.random();
  if (s < 0.05) {
    var q = qsheet.getRange(Math.floor(Math.random()*qsheet.getLastRow()), 1, 1, 4).getValues();
    gamesheet.getRange('D' + row).setValue(q[0][0]);
    gamesheet.getRange('E' + row).setValue(q[0][1]);
    gamesheet.getRange('F' + row).setValue(q[0][2]);
    gamesheet.getRange('G' + row).setValue(q[0][3]);
    gamesheet.getRange('H' + row).setValue("blank");
    gamesheet.getRange('I' + row).setValue("blank");
    gamesheet.getRange('J' + row).setValue(0);
    gamesheet.getRange('K' + row).setValue(0);
    gamesheet.getRange('L' + row).setValue(0);
    gamesheet.getRange('M' + row).setValue(0);
    gamesheet.getRange('N' + row).setValue(0);
  }
  else {
    var q = msheet.getRange(Math.floor(Math.random()*msheet.getLastRow()), 1, 1, 6).getValues();
    gamesheet.getRange('D' + row).setValue(q[0][0]);
    gamesheet.getRange('E' + row).setValue(q[0][1]);
    gamesheet.getRange('F' + row).setValue(q[0][2]);
    gamesheet.getRange('G' + row).setValue(q[0][3]);
    gamesheet.getRange('H' + row).setValue(q[0][4]);
    gamesheet.getRange('I' + row).setValue(q[0][5]);
    gamesheet.getRange('J' + row).setValue(0);
    gamesheet.getRange('K' + row).setValue(0);
    gamesheet.getRange('L' + row).setValue(0);
    gamesheet.getRange('M' + row).setValue(0);
    gamesheet.getRange('N' + row).setValue(1);
  }
}

function reset(row, chat_id, name) {
  gamesheet.getRange('A' + row).setValue(chat_id);
  gamesheet.getRange('B' + row).setValue(name);
  gamesheet.getRange('C' + row).setValue(100);
  gamesheet.getRange('O' + row).setValue(0);
  rollQuestion(row, chat_id, name);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (data.message.text) { // sent a msg :D
    var name = data.message.chat.first_name;
    var chat_id = data.message.chat.id;
    var text = data.message.text;
    var lastrow = gamesheet.getLastRow();
    var userrow = getValidRow(chat_id);

    if (/\/start/.test(text)) {
      sendText(chat_id, "Hello! Welcome to the 100 points game. In this game, you have to try to answer as many questions as possible. For each question, you can divide your 100 points amongst any of the options, and the number of points you have moving forward is dependent on the number of points you place on the correct answer. Of course, the game ends when you reach 0 points.");
      sendText(chat_id, "You start with 100 points, and you can choose to divide your points however you'd like. Use /question to view the current question, /a %3Cpoints%3E , /b %3Cpoints%3E etc. to allocate points respectively. Use /submit once you've finalised your options.");
      sendText(chat_id, "Good luck and have fun! Use /question to get your first question and start the game!");
    }
    if (/\/help/.test(text)) {
      sendText(chat_id, "Hello! Welcome to the 100 points game. In this game, you have to try to answer as many questions as possible. For each question, you can divide your 100 points amongst any of the options, and the number of points you have moving forward is dependent on the number of points you place on the correct answer. Of course, the game ends when you reach 0 points.");
      sendText(chat_id, "You start with 100 points, and you can choose to divide your points however you'd like. Use /question to view the current question, /a %3Cpoints%3E , /b %3Cpoints%3E etc. to allocate points respectively. Use /submit once you've finalised your options.");
      sendText(chat_id, "Good luck and have fun!");
    }
    if (/\/question/.test(text)) {
      if (userrow == -1) {
        userrow = lastrow+1;
        reset(userrow, chat_id, name);
      } sendState(chat_id, userrow);
    }
    if (/\/a /.test(text)) {
      if (userrow == -1) sendText(chat_id, "INVALID!");
      else {
        var beep = text.split(' ')[1];
        var num = parseInt(beep);
        if (num < 0) sendText(chat_id, "INVALID! (negative)");
        else if (beep.indexOf('.') >= 0) sendText(chat_id, "INVALID! (decimal)");
        else {
          var cur_points_a = parseInt(gamesheet.getRange('J' + userrow).getValue());
          var points_remaining = parseInt(gamesheet.getRange('C' + userrow).getValue());
          var valid = points_remaining + cur_points_a - num;
          if (valid >= 0) {
            gamesheet.getRange('J' + userrow).setValue(num);
            gamesheet.getRange('C' + userrow).setValue(valid);
            sendState(chat_id, userrow);
          } else sendText(chat_id, "NOT ENOUGH POINTS!");
        }
      }
    }
    if (/\/b /.test(text)) {
      if (userrow == -1) sendText(chat_id, "INVALID!");
      else {
        var beep = text.split(' ')[1];
        var num = parseInt(beep);
        if (num < 0) sendText(chat_id, "INVALID! (negative)");
        else if (beep.indexOf('.') >= 0) sendText(chat_id, "INVALID! (decimal)");
        else {
          var cur_points_b = parseInt(gamesheet.getRange('K' + userrow).getValue());
          var points_remaining = parseInt(gamesheet.getRange('C' + userrow).getValue());
          var valid = points_remaining + cur_points_b - num;
          if (valid >= 0) {
            gamesheet.getRange('K' + userrow).setValue(num);
            gamesheet.getRange('C' + userrow).setValue(valid);
            sendState(chat_id, userrow);
          } else sendText(chat_id, "NOT ENOUGH POINTS!");
        }
      }
    }
    if (/\/c /.test(text)) {
      if (userrow == -1) sendText(chat_id, "INVALID!");
      else {
        var beep = text.split(' ')[1];
        var num = parseInt(beep);
        if (num < 0) sendText(chat_id, "INVALID! (negative)");
        else if (beep.indexOf('.') >= 0) sendText(chat_id, "INVALID! (decimal)");
        else {
          var cur_points_c = parseInt(gamesheet.getRange('L' + userrow).getValue());
          var points_remaining = parseInt(gamesheet.getRange('C' + userrow).getValue());
          var valid = points_remaining + cur_points_c - num;
          if (valid >= 0) {
            gamesheet.getRange('L' + userrow).setValue(num);
            gamesheet.getRange('C' + userrow).setValue(valid);
            sendState(chat_id, userrow);
          } else sendText(chat_id, "NOT ENOUGH POINTS!");
        }
      }
    }
    if (/\/d /.test(text)) {
      if (userrow == -1) sendText(chat_id, "INVALID!");
      else {
        var beep = text.split(' ')[1];
        var num = parseInt(beep);
        if (num < 0) sendText(chat_id, "INVALID! (negative)");
        else if (beep.indexOf('.') >= 0) sendText(chat_id, "INVALID! (decimal)");
        else {
          var cur_points_d = parseInt(gamesheet.getRange('M' + userrow).getValue());
          var points_remaining = parseInt(gamesheet.getRange('C' + userrow).getValue());
          var valid = points_remaining + cur_points_d - num;
          if (valid >= 0) {
            gamesheet.getRange('M' + userrow).setValue(num);
            gamesheet.getRange('C' + userrow).setValue(valid);
            sendState(chat_id, userrow);
          } else sendText(chat_id, "NOT ENOUGH POINTS!");
        }
      }
    }
    if (/\/submit/.test(text)) {
      if (userrow == -1) sendText(chat_id, "INVALID!");
      else if (parseInt(gamesheet.getRange('C' + userrow).getValue()) > 0) {
        sendText(chat_id, "INVALID! (Points remaining)");
        sendState(chat_id, userrow);
      }
      else {
        sendText(chat_id, "The correct answer was: " + gamesheet.getRange('E'+userrow).getValue() + "!");
        let corr_ans = gamesheet.getRange('E' + userrow).getValue();
        if (corr_ans == gamesheet.getRange('F' + userrow).getValue()) gamesheet.getRange('C' + userrow).setValue(gamesheet.getRange('J' + userrow).getValue());
        else if (corr_ans == gamesheet.getRange('G' + userrow).getValue()) gamesheet.getRange('C' + userrow).setValue(gamesheet.getRange('K' + userrow).getValue());
        else if (corr_ans == gamesheet.getRange('H' + userrow).getValue()) gamesheet.getRange('C' + userrow).setValue(gamesheet.getRange('L' + userrow).getValue());
        else gamesheet.getRange('C' + userrow).setValue(gamesheet.getRange('M' + userrow).getValue());
        if (gamesheet.getRange('C' + userrow).getValue() == 0) {
          sendText(chat_id, "GAME OVER! Your score is: " + String(gamesheet.getRange('O' + userrow).getValue()));
          reset(userrow, chat_id, name);
          sendText(chat_id, "Use /question when you want to play again!");
        }
        else {
          gamesheet.getRange('O' + userrow).setValue(gamesheet.getRange('O' + userrow).getValue()+1);
          rollQuestion(userrow, chat_id, name);
          sendState(chat_id, userrow);
        }
      }
    }
  }
}