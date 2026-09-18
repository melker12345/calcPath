### Plan for quick visual creation.

I'm thinking you generate a list for the topics most in need of a visual.
We then go subject per subject chapter by chapter


To make this seamless, I want a new branch "visual" that holds a page for all visuals you make.
http://localhost:3000/visuals displays subjects -> chapter -> visuals for that chapter.

In the http://localhost:3000/visuals/{subject}/{chapter} we list each visual and each visual gets 
- A brief explanation of what it represents.
- Grade, three buttons Bad, OK, Good. 
- Small input field that I can type feedback into.
- Small [version]

From this we have a feedback object that gets logged to a listening instance of you (Claude code),
You will fix the feedback as it comes in, and once you have fixed the feedback you update the visual and increment the version.




