text = """
[[V1]]
I have this hope
As an anchor for my soul
---
[[V1]]
Through every storm
I will hold to You
---
[[V2]]
With endless love
All my fear is swept away
---
[[V2]]
In everything
I will trust in You
---
[[C]]
There is hope in the promise of the cross
You gave everything to save the world You love
---
[[C]]
And this hope is an anchor for my soul
Our God will stand unshakable
---
[[V3]]
Unchanging One
You who was and is to come
---
[[V3]]
Your promise sure
You will not let go
---
[[C]]
There is hope in the promise of the cross
You gave everything to save the world You love
---
[[C]]
And this hope is an anchor for my soul
Our God will stand unshakable
---
[[C]]
There is hope in the promise of the cross
You gave everything to save the world You love
---
[[C]]
And this hope is an anchor for my soul
Our God will stand unshakable
---
[[B]]
Your Name is higher
Your Name is greater
---
[[B]]
All my hope is in You
Your word unfailing
---
[[B]]
Your promise unshaken
All my hope is in You
---
[[B]]
Your Name is higher
Your Name is greater
---
[[B]]
All my hope is in You
Your word unfailing
---
[[B]]
Your promise unshaken
All my hope is in You
---
[[VOICE]]
VOICE
---
[[DRUM]]
DRUM
---
[[ONLY]]
ONLY
---
[[B]]
Your Name is higher
Your Name is greater
---
[[B]]
All my hope is in You
Your word unfailing
---
[[B]]
Your promise unshaken
All my hope is in You
===
[[V1]]
Christ is my reward
And all of my devotion
---
[[V1]]
Now there's nothing in this world
That could ever satisfy
---
[[V1]]
Through every trial
My soul will sing
---
[[V1]]
No turning back
I've been set free
---
[[C]]
Christ is enough for me
Christ is enough for me
---
[[C]]
Everything I need is in You
Everything I need
---
[[V2]]
Christ my all in all
The joy of my salvation
---
[[V2]]
And this hope will never fail
Heaven is our home
---
[[V2]]
Through every storm
My soul will sing
---
[[V2]]
Jesus is here
To God be the glory
---
[[C]]
Christ is enough for me
Christ is enough for me
---
[[C]]
Everything I need is in You
Everything I need
---
[[B]]
I have decided to follow Jesus
No turning back
---
[[B]]
No turning back
(x2)
---
[[B]]
The cross before me
The world behind me
---
[[B]]
No turning back
No turning back
---
[[B]]
(x2)
---
[[C]]
Christ is enough for me
Christ is enough for me
---
[[C]]
Everything I need is in You
Everything I need
---
[[C]]
Christ is enough for me
Christ is enough for me
---
[[C]]
Everything I need is in You
Everything I need
---
[[ENDING]]
I have decided to follow Jesus
No turning back
---
[[ENDING]]
No turning back
(x3)
===
[[V1]]
Draw me close to You
Never let me go
---
[[V1]]
I lay it all down again
To hear You say that I'm Your friend
---
[[V2]]
You are my desire
No one else will do
---
[[V2]]
'Cause nothing else could take Your place
To feel the warmth of Your embrace
---
[[V2]]
Help me find the way
Bring me back to You
---
[[C]]
You're all I want
You're all I've ever needed
---
[[C]]
You're all I want
Help me know You are near
---
[[V1]]
Draw me close to You
Never let me go
---
[[V1]]
I lay it all down again
To hear You say that I'm Your friend
---
[[V2]]
You are my desire
No one else will do
---
[[V2]]
'Cause nothing else could take Your place
To feel the warmth of Your embrace
---
[[V2]]
Help me find the way
Bring me back to You
---
[[C]]
You're all I want
You're all I've ever needed
---
[[C]]
You're all I want
Help me know You are near
---
[[C]]
You're all I want
You're all I've ever needed
---
[[C]]
You're all I want
Help me know You are near
---
[[ENDING]]
Help me know You are near
---
[[X2]]
X2
""".strip()

import re

print('[[x2]]'.lstrip('[').rstrip(']'))
x = re.split(r'\n={3,}\n', text)

# for e in x:
# 	print(e)
# 	print('\n\n\n')

