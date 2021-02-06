import { LineParser } from './LineParser'

export function initButton(): void {
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement
  const form = document.lyricsform
  const textArea = form.lyrics
  const hiddenBody = form.body
  submitButton.onclick = function () {
    const lineParser = new LineParser(textArea.value)
    const result = processLyricsText(textArea.value)
    hiddenBody.value = result
    form.submit()
  }
}
