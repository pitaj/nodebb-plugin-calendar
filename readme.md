#nodebb-plugin-calendar

This plugin adds a site-wide calendar to NodeBB.

##Installation
Current alpha/beta version can be installed by doing the following:

 1. Open a terminal in the NodeBB root directory
 2. Install the latest *nodebb-plugin-calendar*:
    `npm install nodebb-plugin-calendar@1.0.0_alpha1`
 3. Restart nodebb and activate the plugin

##Configuration
Before do anything with the Calendar, make sure you have the correct settings set up in the ACP plugin settings page. Also, configure permissions for who can post events in the category management section of the ACP.

##Features
 * Events created, edited, and deleted as part of a post
 * Native NodeBB category permissions are used to determine who can post and view events
 * Public events as part of the same permissions system
 * Response system for easy user responses (yes, maybe, no)
 * Configurable automated reminders for upcoming events using NodeBB's notifications system
 * Centralized calendar interface to view all upcoming events

####In The Works
 * iCal export
 * Simplistic, graceful calendar UI (infinite scroll) with mobile support

## Suggestions? Encountered a Bug?
Please submit all feature requests and bugs with the [Issue tracker at Github.](https://github.com/pitaj/nodebb-plugin-calendar/issues) Thanks!
