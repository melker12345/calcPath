## Here are some features I want added.


## Main features.

### Explanation swapout 

Why:
Text sections in a module might be explaining the consept in a way the user do not understad.
This is why we might want a button for some sections that renders an other explenation.

Explanation:
We explain topic A.
We might initially load explanation of A in format A1,
But if the user struggles to understand what is meant by A1 we offer the user to load A2.

Negative:
This would mean for each explenation we store multiple verions.

Bennefit:
We would also have the ability to track wich explenations are best from user input
E.g. Was this explenation better or worse. 



---

## General ideas (not thought out.)

### Linking external reasourses.
We should for each topic link to external reasourses like youtube videos or other well structured explenations of that topic.


### Topics home page (/calculus /statistiks etc.)

Should all have a rotating problem that is displayed.
We should show a problem and its solution in detail
By rotating I mean it should not be one static problem, say we allocate 5 questions that on page reload alternates.

### Font size 

It would be great if we had like a button "assesible" that reloaded the page with new css.
This would emphezise on makinging text ledgible, styled like Wikipedia no animations fancy colors etc. 
This could also serve as a function for allowing the user to set what font size they want - one setting dictates the size of the smallest latax to be no less then X, the other latax and normal text has to adjust to this minimum.
So this might entail us setting up different "schemas" for text size. meaning if smallest latext is of size X normal text is F(X) etc. to make the text legability more adjustible for the users. 


### 

# Website Tasks & Improvements

Also we have some smaller css fixes:
- Font on the home page needs to not be the font for /calculus
- The following SectionCard needs to be restyled a touch to match the calculus pattern better.
- We also need to fix some small things on mobile
- The buttons on /calculus need to get centered when stacked next to each other as it occupies too much screen width
- The footer on mobile needs to be better, one thing could be to right-align the links on the right-hand side so that the UX on mobile becomes better.
- And as for the MathInput on mobile there are a couple of things that we could improve:

1. The user should not have to scroll to press next question, this can be fixed by changing the "correct answer" into a model that replaces the math input area but does not cover the question.  
   so that the user can view the question and all actions on same screen for reflecting - this should be a general rule for any place that the user inputs stuff, i.e. that the question is visible when the user inputs.  
   also the user should not have to scroll when the user presses "hint", when "not quite" appears nor when the "correct answer" appears, for the aforementioned scenarios the user should be able to see the question without having to scroll, this is important


**More of niceties than things to focus on**

1. It would be nice if there was a button to switch to "draw" where the user can write some math with their fingers on mobile/tablets.

2. Allowing the user to set the absolute minimum font and have the rest of the fonts across the whole site adjust. so we have some preset font-sizes for all fonts and when the user adjusts it in their profile page all fonts get adjusted this includes starting page, topics page and all of the other pages.  
   I'm thinking we define the absolute smallest size some latex character can be and adjust the rest based on it.  
   To build on this we could allow the user to load a more "simple" theme that applies more of a wikipedia styling to all pages where we remove completely the focus on "how good" things look and simply focus on making everything easily readable and interactable, no fancy colors, animations, rounded borders, fancy stuff.



---

### Some thoughts

We are starting to get real users using our site.
We need some feedback ability.
I'm thinking we place a simple feed back link in the footer.
I want just general feed back so perhaps we could do a simple feedback page that contains a simple form.

"
Hello, Any feedback is highly appriciated.
I'm currently working on refining some smaller stuff but if you have some idea or thoughts please let me know.

Type of feedback (is it a bugg or feature?): <input> </input>
Message: <input> </input>

Thanks for the feedback!
"

It would be nice to have a good way for me to read this.
Either I'm thinking a section on the admin users page that shows the feedback, or have this send to my email.
but I do not want the users to have to leave the app to send a mail from their email, so in this case it would be programaticly sent from feedback@calc-path.com to feedback@calc-path.com.

This is just a rough out line for what i want please give me your thoughts and tell me how you think we should handle this the best way without loading the db with unnecessarly much data (i know it wont be that much raw data, but since im on supabases free plan i want to make as few request as possible, the resend mailing servace I use is also free teir so perhaps there is a more stream line approch to this)