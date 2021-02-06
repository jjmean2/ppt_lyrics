// import { initButton } from 'main'

// window.onload = () => {
//   initButton()
// }

import { LineParser } from './LineParser'
import { LyricParser } from './LyricParser'
import { SlideConvertMethod } from './SongParser'

const text = `Jan 31, 2021 -
** Lord's prayer song

1. Anchor (D)
https://youtu.be/87GYkLfQQ-8
V1 V2 C 간주 V3 C C 간주 B B(voice/drum only) B

V1
I have this hope
As an anchor for my soul
Through every storm
I will hold to You

V2
With endless love
All my fear is swept away
In everything
I will trust in You

C
There is hope in the promise of the cross
You gave everything to save the world You love
And this hope is an anchor for my soul
Our God will stand unshakable

V3
Unchanging One
You who was and is to come
Your promise sure
You will not let go

B
Your Name is higher
Your Name is greater
All my hope is in You
Your word unfailing
Your promise unshaken
All my hope is in You

2. Christ is enough(A)
https://youtu.be/teUxQpnhezY
V1-C-V2-C-간주-B-C-C-Ending

V1
Christ is my reward
And all of my devotion
Now there's nothing in this world
That could ever satisfy
Through every trial
My soul will sing
No turning back
I've been set free

C
Christ is enough for me
Christ is enough for me
Everything I need is in You
Everything I need

V2
Christ my all in all
The joy of my salvation
And this hope will never fail
Heaven is our home
Through every storm
My soul will sing
Jesus is here
To God be the glory

B
I have decided to follow Jesus
No turning back
No turning back
(x2)

The cross before me
The world behind me
No turning back
No turning back
(x2)

Ending
I have decided to follow Jesus
No turning back
No turning back
(x3)

3. Draw me close(A)
https://youtu.be/7d_oYr-P16M
음원 그대로
V1 V2 C V1 V2 C C Ending(x2)


V1
Draw me close to You
Never let me go
I lay it all down again
To hear You say that I'm Your friend

V2
You are my desire
No one else will do
'Cause nothing else could take Your place
To feel the warmth of Your embrace
Help me find the way
Bring me back to You

C
You're all I want
You're all I've ever needed
You're all I want
Help me know You are near

Ending
Help me know You are near
`

const parser = new LyricParser(text)
console.log(parser.toFormText(SlideConvertMethod.withFlowOrder))
