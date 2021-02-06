import { LyricParser } from './LyricParser'

export function initButton(): void {
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement
  const form = document.lyricsform
  const textArea = form.lyrics
  const hiddenBody = form.body
  submitButton.onclick = function () {
    const parser = new LyricParser(textArea.value)
    hiddenBody.value = parser.toFormText()
    form.submit()
  }
}
