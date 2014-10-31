#nodebb-plugin-calendar

This plugin adds a site-wide calendar to NodeBB.

##Installation

Two options:

 1.  Install the plugin through the ACP (if it ever gets added to the list *cough cough*)
 2.  Run `npm install nodebb-plugin-calendar` in the root directory of the NodeBB install

Don't forget to restart after installing the plugin. After installing, a calendar icon should appear next to the rest in the header menu

##Configuration
Before do anything with the Calendar, make sure you have the correct settings set up in the ACP plugin setting page. It will tell you what to do.

After you've saved the settings in the plugin page, make sure you configure the category you selected for events to match the permissions for each user and group in the plugin settings. This will eventually be automated.

Note: If you don't know the id# of the category you want the events to be posted in, edit something about the event, and when you click save, the alert will tell you the event id#. Then you can change back whatever you did.

##Features
* Synchronization between different users' activities on the Calendar page
* Full permissions system separate from that of the main site
* Individual event permissions for viewing and editing of the event
* Public events (even guests can see them)
* Simplistic, graceful UI (infinite scroll OMG!)
* Comments system using NodeBB topics
* Response system for easy user responses
* Click a day on the calendar to select it, and show its events in the sidebar
* Click an event in either the sidebar or the calendar to show its details in the sidebar
* All events are posted in the events category specified in the ACP *Note: events can only be edited from the Calendar interface*
* Jump to year and month from the fields above the Calendar
* Configurable automated notifications for upcoming events

*Sadly, this plugin does not currently support mobile devices. This is a feature I plan on adding by version 0.1.5 at the latest*

####In The Works

* Sort events by time
* Automate category permissions
* Mobile device support
* iCal export
* Event permalinks on calendar page

## Suggestions? Encountered a Bug?
Please submit all feature requests and bugs with the [Issue tracker at Github.](https://github.com/pitaj/nodebb-plugin-calendar/issues) Thanks
