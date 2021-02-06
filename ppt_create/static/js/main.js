window.onload = function () {
  initButton();
};

function initButton() {
  var submitButton = document.getElementById("submit-button");
  var form = document.lyricsform;
  var textArea = form.lyrics;
  var hiddenBody = form.body;
  submitButton.onclick = function () {
    var result = processLyricsText(textArea.value);
    hiddenBody.value = result;
    form.submit();
  };
}

var partCategoryKeywords = [/[Vv]\d{1}?/, /[Pp][Cc]\d{1}?/, /[Bb]/];

function isTextCategory(text) {
  partCategoryKeywords.some(function (pattern) {
    return pattern.test(text);
  });
}

function processLyricsText(text) {
  return text;
}

function makeStructureForSingleSong(songText) {}

function splitSongPartText(songPartText) {
  var lines = songPart.trim().split("\n");
  if (lines.length === 0) {
    return [];
  }
}
