import os
from django.shortcuts import render
from pptx import Presentation
from io import BytesIO
from django.http import HttpResponse
from .forms import LyricsForm

def lyrics(request):
    form = LyricsForm()
    if request.method == 'POST':
        form = LyricsForm(request.POST)
        if form.is_valid():
            body = form.cleaned_data['body']
            ppt = create_ppt_content(body)
            response = HttpResponse(
                content_type='application/vnd.ms-powerpoint')
            response['Content-Disposition'] = 'attachment; filename="lyrics.pptx"'
            response.write(ppt)
            return response
    else:
        context = {
            'form': form
        }
        return render(request, 'lyrics.html', context)


def create_ppt_content(body):
    module_dir = os.path.dirname(__file__)
    template_file = 'resources/tehilla_ppt_template.pptx'
    file_path = os.path.join(module_dir, template_file)
    prs = Presentation(file_path)
    fill_lyrics_slides(prs, body)
    source_stream = BytesIO()
    prs.save(source_stream)
    ppt = source_stream.getvalue()
    source_stream.close()
    return ppt


def fill_lyrics_slides(prs, body):
    lyrics_slide_layout = prs.slide_layouts[1]
    empty_slide_layout = prs.slide_layouts[2]

    source = body.splitlines()
    print(body, source)

    for text in source:
        if text:
            slide = prs.slides.add_slide(lyrics_slide_layout)
            title = slide.placeholders[0]
            title.text = text
        else:
            prs.slides.add_slide(empty_slide_layout)
