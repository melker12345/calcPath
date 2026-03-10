## Here are some features I want added.

### Explanation swapout 

Why:
Text sections in a module might be explaining the consept in a way the user do not understad.
This is why we might want a button for some sections that displays an other explenation.

Explanation:
Say we are to explain topic A.
We might initially load explanation of A in format A1,
But if the user struggles to understand what is meant by A1 we offer the user to load A2.

Negative:
This would mean for each text we store multiple explanation.

Bennefit:
We would also have the ability to track wich explenations are best. (from user input
E.g. Was this explenation better or worse. 


### Feedback loop
We need feedback from uesrs to be easy and well structured.

Say someone has a good suggestion as to how we should teach something, where and how do they subbmit their feedback.

If users want to suggest topic, rewrite a section. 


### Linking external reasourses.
We should for each topic link to external reasourses like youtube videos or other well structured explenations of that topic.


### Topics home page (/calculus /statistiks etc.)

Should all have a rotating problem that is displayed.
We should show a problem and its solution in detail
By rotating I mean it should not be one static problem, say we allocate 5 questions that on page reload alternates.



### Storing of progress
We currently store user progression in db and for users with out account their progress is stored in localstorage.

Would it not be possible to have the progress hashed into a easily sharable string like "A1B2a1" this allows for all data to be in localstorage.
If user want to switch device/browser they enter their code and the progression is retreaved from it. 
This idea stems from two things one being that hashing information into codes and sharing it is fun.
The other reason is that progression tracktion is not vital nor really needed, thus just cluttering the db.

Okay so how long does the code have to be to store the users progression?
For this we need to consider how much data we need to hash, how many users we expect.

