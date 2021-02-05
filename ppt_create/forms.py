from django import forms


class LyricsForm(forms.Form):
    body = forms.CharField(widget=forms.HiddenInput(attrs={
        "class": "form-control",
    }))
