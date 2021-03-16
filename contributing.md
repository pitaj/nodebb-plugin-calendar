# Pre-release checklist

TODO: Convert this into actual tests when possible

## Setup

Create two categories (`A` and `B`) and four users (`admin`, `aaaa`, `bbbb`, `cccc`) with the following privileges.

- admin: admin user, has all permissions
- aaaa
  + A: Find category, Access category, Access topics, Create topics, Reply to topics, Edit posts, Delete posts, Delete topics, Post events, Post mandatory events
  + B: Find category, Access category, Access topics, Create topics
- bbbb
  + A: Find category, Access category, Access topics, Create topics, Reply to topics
  + B: Find category, Access category, Access topics, Create topics, Reply to topics, Delete posts, Delete topics, Post events
- cccc
  + A: Find category, Access category
  + B: Find category, Access category, Access topics

Change user `aaaa` Language setting to en-GB. (#139)

Set Calendar Plugin settings.

- Only allow events in the main post of a topic: Checked
- Link the permission to respond to an event to the reply permission: Checked

## Execution

As _admin_, create topic "Event 1" in category A.

- All day: Checked
- Dates
  + Start: [Today]
  + End: [Today]
- Location: `Wherever event 1 is`
- Description:
```text
This is the **first** event.

It will be a `great` one.
```
- Mandatory: Checked
- Reminders:
  + 1 hour
  + Custom: 5 minutes
- Repetition
  + !! Ensure each of the non-Custom entries results in the value being set to the popup label
  + Custom
    * Fri, Sat
    * Until a date: [Default] (Should default to Today + 1 week)

Start a reply.

!! Ensure calendar button does not show up.

Force button to display by running
```js
$('[data-format="plugin-calendar-event"]').css('display', 'inline')
```  
Add event "Event 1.1" to post, details irrelevant.

!! Ensure "Event 1.1" does NOT show up when reply is posted  
!! Ensure "Event 1.1" does NOT show up on Calendar page  
!! Ensure "Event 1" shows up on Calendar page, with instances on today, Fri, and Sat  

Edit "Event 1" so it starts on the closest Friday.

!! Ensure there are NO duplicate entries for "Event 1" on Calendar page  
!! Ensure _aaaa_ and _bbbb_ can see "Event 1" rendered in topic  
!! Ensure _cccc_ can NOT see "Event 1" rendered in topic  
!! Ensure _aaaa_ and _bbbb_ can see "Event 1" on Calendar page  
!! Ensure _cccc_ can NOT see "Event 1" on Calendar page  

!! Ensure clicking on "Go to post" button on Calendar page correctly navigates to the topic
!! Ensure clicking the browser Back button takes you back to the event display

As _admin_, start creating a new topic and begin adding an event. Set a custom repetition:
- Mon, Thu
- Until a date: Tomorrow

Cancel event creation, and reopen the event editor.

!! Ensure Repetition is set to "Does not repeat"  
!! Ensure that days under Custom were reset (all unselected)  
!! Ensure that "Forever" is selected  
!! Ensure that the date in "Until a date" was reset to a week from now  

As _aaaa_, create topic "Event 2" in category A.

- All day: Unchecked
- Dates
  + Start: [20min from now]
  + End: [1hour from now]
- Location: `https://google.com`
- Description:
```text
Malo fixa *sanguine cognitus*, sub duorum scitaris, in. Sententia deficit Athis. Vero cornua pedibus, alteriusque exanimi genuit! Dolor infelix temperat sacra [contingat nostrae](http://vigilterra.org/distentustalibus.php); trementi fors quod [et fratres](http://consequitur-lyciae.net/nudaque.php). Flammae subdita, vultusque heu vestro cervus resque et femina tellus.
```
- Mandatory: Checked
- Reminders:
  + 10 minutes
- Repetition: Every month

!! Ensure repeated instances show up on Calendar page  
!! Ensure _aaaa_ and _bbbb_ can see "Event 2" rendered in topic  
!! Ensure _cccc_ can NOT see "Event 2" rendered in topic  
!! Ensure _aaaa_ and _bbbb_ can see "Event 2" on Calendar page  
!! Ensure _cccc_ can NOT see "Event 2" on Calendar page  
!! Ensure _admin_, _aaaa_, and _bbbb_ receive a reminder 10 minutes before the event start  

Set Calendar Plugin settings.

- Only allow events in the main post of a topic: Unchecked

As _aaaa_, in a reply to "Event 2", create "Event 3".

!! Ensure event button now shows up

- All day: Unchecked
- Dates
  + Start: [20min from now]
  + End: [1hour from now]
- Location: `A place with much love`
- Description:
```text
Petens aliamve quae, mihi senectae pondera nostris navale qui. Tergaque postquam! Bis edidit, et quam caede luctuque: et liquidus adde utar: regia, et. Oppida tonitrua factura: perveni sive?

- Nos enim fluidos possit guttura paulum invenit
- Labores et arbutus aureus
- Rudem adulterium atque
- Tempora o da suam agro pater erat
```
- Mandatory: Unchecked
- Reminders:
  + 10 minutes
- Repetition: Every year

Edit post and edit event.

- Reminders:
  - Custom: 1 minute

!! Ensure repeated instances show up on Calendar page  
!! Ensure _aaaa_ and _bbbb_ can see "Event 3" rendered in topic  
!! Ensure _cccc_ can NOT see "Event 3" rendered in topic  
!! Ensure _aaaa_ and _bbbb_ can see "Event 3" on Calendar page  
!! Ensure _cccc_ can NOT see "Event 3" on Calendar page  

As _aaaa_, respond "Maybe" for "Event 3" today. As _bbbb_, respond "Yes" for "Event 3" today.

!! Ensure responses shows up in lists on topic page and Calendar page  
!! Ensure _bbbb_ receives a reminder 1 minute before the event start  
!! Ensure _aaaa_ receives a reminder on event start  
!! Ensure _admin_ does NOT receive a reminder  

As _bbbb_, create a new topic named "Event 4" in category B.

!! Ensure Mandatory checkbox does not show up

- All day: Unchecked
- Dates
  + Start: [10min from now]
  + End: [1hour from now]
- Location: `Best place in the immediate viscinity`
- Description:
```text
Abiit velatus circumdare reppulit [dubium veteremque](http://ut-placere.org/vulnusperspicuus) unum postquam materiam ore. Nemo Perseus incepto ora puer diem pereat meumque altera gentem mirantem Apollinis Achillem *quae religata Sparte* numeroque. Clauso a fulvo victricemque pastae exercere **saevaque differt** regina sparsit, mea vellet. Nudabant terras eris, *titubantis patriamque* vos. Amor lumina voluitque, est non tardius, festis argumentum instar.
```
- Reminders:
  + Custom: 5 minutes
- Repetition: Does not repeat

!! Ensure _aaaa_, _bbbb_, and _cccc_ can see "Event 4" rendered in topic  
!! Ensure _aaaa_, _bbbb_, and _cccc_ can see "Event 4" on Calendar page  
!! Ensure _aaaa_ and _cccc_ can NOT see response buttons  

As _bbbb_, respond "Yes" for "Event 4".

!! Ensure _bbbb_'s response shows up in lists on topic page and Calendar page  
!! Ensure _bbbb_ receives a reminder 5 minutes before event start

Set Calendar Plugin settings.

- Link the permission to respond to an event to the reply permission: Unchecked

!! Ensure _aaaa_ and _cccc_ can now see response buttons  

As _aaaa_, respond "No". As _cccc_, respond "Maybe".

!! Ensure responses shows up in lists on topic page and Calendar page

!! Ensure _cccc_ receives a reminder on event start  
