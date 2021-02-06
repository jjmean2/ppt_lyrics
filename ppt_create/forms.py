from django import forms


class LyricsForm(forms.Form):
    filename = forms.CharField(widget=forms.HiddenInput(attrs={
        "id": "filename-text",
        "class": "form-control",
    }))

    body = forms.CharField(widget=forms.HiddenInput(attrs={
        "id": "hidden-text",
        "class": "form-control",
    }))
