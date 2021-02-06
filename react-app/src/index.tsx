import "./index.css";
import { LyricParser } from "./parser/LyricParser";

window.onload = () => {
  const submitButton = document.getElementById(
    "submit-button"
  ) as HTMLButtonElement;
  const form = document.lyricsform;
  const textArea = form.lyrics;
  const hiddenBody = form.body;
  submitButton.onclick = function () {
    console.log(textArea.value);
    const parser = new LyricParser(textArea.value);
    hiddenBody.value = parser.toFormText();
    console.log(hiddenBody.value);
    form.submit();
  };
};
