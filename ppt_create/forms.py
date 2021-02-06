from django import forms


class LyricsForm(forms.Form):
    body = forms.CharField(widget=forms.HiddenInput(attrs={
        "id": "hidden-text",
        "class": "form-control",
    }))
