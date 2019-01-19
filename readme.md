# nodebb-plugin-calendar

This plugin adds a site-wide calendar to NodeBB. It also lets you create and customize events.

![Event](https://i.imgur.com/Rafqlcm.png)
![Calendar](https://i.imgur.com/g44COuv.png)

## Installation
 1. Install and activate this plugin on the ACP "Plugins" page
 2. Restart and rebuild your NodeBB

## Configuration
Before do anything with the Calendar, make sure you have the correct settings set up in the ACP plugin settings page. Also, configure permissions for who can post events in the category management section of the ACP.

## Features
 * Events created, edited, and deleted as part of a post
 * Native NodeBB category permissions are used to determine who can post and view events
 * Public events as part of the same permissions system
 * Response system for easy user responses (yes, maybe, no)
 * Configurable automated reminders for upcoming events using NodeBB's notifications system
 * Centralized calendar interface to view all upcoming events

## How event creation works
 - Open the composer for creating a new topic or replying to a post. If you have permissions to post an event, you'll see a calendar icon in the toolbar. Click it to add an event to the post or edit an existing event.
 - Enter an **Event name**, this will show up on the calendar and on the previews.
 - **All day** defines if the event has a particular time or if you only want to be specific to the day.
 - Enter the start and end **Dates**. The end date must be after the start date.
 - The **Location** is parsed like a post, but can only be one line.
 - Put details in the **Description** field, which is also parsed like a post.
 - Add **Reminders** determine when subscribers get notifications about the event.
 - **Mandatory** events disable responses and send all reminders to any user that can view the event.

## In The Works
 * iCal export
 * Simplistic, graceful calendar UI (infinite scroll) with mobile support

## Suggestions? Encountered a Bug?
Please submit all feature requests and bugs with the [Issue tracker at Github.](https://github.com/pitaj/nodebb-plugin-calendar/issues) Thanks!
