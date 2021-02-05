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

function processLyricsText(text) {
  return text;
}
