import Promise from 'bluebird';
import ICAL from 'ical.js';
import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, escapeEvent } from './event';
import { filterByPid, privilegeNames } from './privileges';
import { getOccurencesOfRepetition } from './repetition';
import { getSetting } from './settings';

const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

const p = Promise.promisify;
const iCal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
UID:0@chrisgregori.co.uk/playdate
DTSTART:20170706T000001Z
DTEND:20170706T000002Z
SUMMARY:Gundam Versus
END:VEVENT
BEGIN:VEVENT
UID:1@chrisgregori.co.uk/playdate
DTSTART:20170706T000001Z
DTEND:20170706T000002Z
SUMMARY:Kirby's Blowout Blast
END:VEVENT
BEGIN:VEVENT
UID:2@chrisgregori.co.uk/playdate
DTSTART:20170711T000001Z
DTEND:20170711T000002Z
SUMMARY:Serial Cleaner
END:VEVENT
BEGIN:VEVENT
UID:3@chrisgregori.co.uk/playdate
DTSTART:20170711T000001Z
DTEND:20170711T000002Z
SUMMARY:Fable Fortune
END:VEVENT
BEGIN:VEVENT
UID:4@chrisgregori.co.uk/playdate
DTSTART:20170711T000001Z
DTEND:20170711T000002Z
SUMMARY:Final Fantasy XII: The Zodiac Age
END:VEVENT
BEGIN:VEVENT
UID:5@chrisgregori.co.uk/playdate
DTSTART:20170711T000001Z
DTEND:20170711T000002Z
SUMMARY:Minecraft: Story Mode - Season 2
END:VEVENT
BEGIN:VEVENT
UID:6@chrisgregori.co.uk/playdate
DTSTART:20170712T000001Z
DTEND:20170712T000002Z
SUMMARY:The End is Nigh
END:VEVENT
BEGIN:VEVENT
UID:7@chrisgregori.co.uk/playdate
DTSTART:20170712T000001Z
DTEND:20170712T000002Z
SUMMARY:Pictlogica: Final Fantasy
END:VEVENT
BEGIN:VEVENT
UID:8@chrisgregori.co.uk/playdate
DTSTART:20170713T000001Z
DTEND:20170713T000002Z
SUMMARY:The Inner World: The Last Wind Monk
END:VEVENT
BEGIN:VEVENT
UID:9@chrisgregori.co.uk/playdate
DTSTART:20170713T000001Z
DTEND:20170713T000002Z
SUMMARY:100% Pasukaru Sensei: Perfect Paint Bombers
END:VEVENT
BEGIN:VEVENT
UID:10@chrisgregori.co.uk/playdate
DTSTART:20170717T000001Z
DTEND:20170717T000002Z
SUMMARY:Fighting Fantasy Legends
END:VEVENT
BEGIN:VEVENT
UID:11@chrisgregori.co.uk/playdate
DTSTART:20170718T000001Z
DTEND:20170718T000002Z
SUMMARY:Yonder: The Cloud Catcher Chronicles
END:VEVENT
BEGIN:VEVENT
UID:12@chrisgregori.co.uk/playdate
DTSTART:20170718T000001Z
DTEND:20170718T000002Z
SUMMARY:Children of Zodiarcs
END:VEVENT
BEGIN:VEVENT
UID:13@chrisgregori.co.uk/playdate
DTSTART:20170720T000001Z
DTEND:20170720T000002Z
SUMMARY:Sumikko Gurashi: Here, Where I am?
END:VEVENT
BEGIN:VEVENT
UID:14@chrisgregori.co.uk/playdate
DTSTART:20170720T000001Z
DTEND:20170720T000002Z
SUMMARY:Koueki Zaidan Houjin Nippon Kanji Nouryoku Kentei Kyoukai Kanken Training 2
END:VEVENT
BEGIN:VEVENT
UID:15@chrisgregori.co.uk/playdate
DTSTART:20170720T000001Z
DTEND:20170720T000002Z
SUMMARY:Lone Echo
END:VEVENT
BEGIN:VEVENT
UID:16@chrisgregori.co.uk/playdate
DTSTART:20170720T000001Z
DTEND:20170720T000002Z
SUMMARY:Rabi X Laby: Rabbit X Labyrinth Puzzle Out Stories
END:VEVENT
BEGIN:VEVENT
UID:17@chrisgregori.co.uk/playdate
DTSTART:20170720T000001Z
DTEND:20170720T000002Z
SUMMARY:Layton’s Mystery Journey: Katrielle and the Millionaires’ Conspiracy
END:VEVENT
BEGIN:VEVENT
UID:18@chrisgregori.co.uk/playdate
DTSTART:20170721T000001Z
DTEND:20170721T000002Z
SUMMARY:Splatoon 2
END:VEVENT
BEGIN:VEVENT
UID:19@chrisgregori.co.uk/playdate
DTSTART:20170725T000001Z
DTEND:20170725T000002Z
SUMMARY:Fortnite
END:VEVENT
BEGIN:VEVENT
UID:20@chrisgregori.co.uk/playdate
DTSTART:20170725T000001Z
DTEND:20170725T000002Z
SUMMARY:Pyre
END:VEVENT
BEGIN:VEVENT
UID:21@chrisgregori.co.uk/playdate
DTSTART:20170728T000001Z
DTEND:20170728T000002Z
SUMMARY:Hey! Pikmin
END:VEVENT
BEGIN:VEVENT
UID:22@chrisgregori.co.uk/playdate
DTSTART:20170728T000001Z
DTEND:20170728T000002Z
SUMMARY:Namco Museum
END:VEVENT
BEGIN:VEVENT
UID:23@chrisgregori.co.uk/playdate
DTSTART:20170729T000001Z
DTEND:20170729T000002Z
SUMMARY:Dragon Quest XI: Sugisarishi Toki o Motomete
END:VEVENT
BEGIN:VEVENT
UID:24@chrisgregori.co.uk/playdate
DTSTART:20170802T000001Z
DTEND:20170802T000002Z
SUMMARY:Leylines
END:VEVENT
BEGIN:VEVENT
UID:25@chrisgregori.co.uk/playdate
DTSTART:20170803T000001Z
DTEND:20170803T000002Z
SUMMARY:Dai Gyakuten Saiban 2: Naruhodo Ryunosuke no Kakugo
END:VEVENT
BEGIN:VEVENT
UID:26@chrisgregori.co.uk/playdate
DTSTART:20170805T000001Z
DTEND:20170805T000002Z
SUMMARY:Sydney Hunter and the Sacred Tribe
END:VEVENT
BEGIN:VEVENT
UID:27@chrisgregori.co.uk/playdate
DTSTART:20170808T000001Z
DTEND:20170808T000002Z
SUMMARY:Hellblade
END:VEVENT
BEGIN:VEVENT
UID:28@chrisgregori.co.uk/playdate
DTSTART:20170808T000001Z
DTEND:20170808T000002Z
SUMMARY:LawBreakers
END:VEVENT
BEGIN:VEVENT
UID:29@chrisgregori.co.uk/playdate
DTSTART:20170808T000001Z
DTEND:20170808T000002Z
SUMMARY:Mega Man Legacy Collection 2
END:VEVENT
BEGIN:VEVENT
UID:30@chrisgregori.co.uk/playdate
DTSTART:20170815T000001Z
DTEND:20170815T000002Z
SUMMARY:Agents of Mayhem
END:VEVENT
BEGIN:VEVENT
UID:31@chrisgregori.co.uk/playdate
DTSTART:20170822T000001Z
DTEND:20170822T000002Z
SUMMARY:Uncharted: The Lost Legacy
END:VEVENT
BEGIN:VEVENT
UID:32@chrisgregori.co.uk/playdate
DTSTART:20170824T000001Z
DTEND:20170824T000002Z
SUMMARY:Cook, Serve, Delicious! 2!!
END:VEVENT
BEGIN:VEVENT
UID:33@chrisgregori.co.uk/playdate
DTSTART:20170825T000001Z
DTEND:20170825T000002Z
SUMMARY:F1 2017
END:VEVENT
BEGIN:VEVENT
UID:34@chrisgregori.co.uk/playdate
DTSTART:20170825T000001Z
DTEND:20170825T000002Z
SUMMARY:Madden NFL 18
END:VEVENT
BEGIN:VEVENT
UID:35@chrisgregori.co.uk/playdate
DTSTART:20170829T000001Z
DTEND:20170829T000002Z
SUMMARY:Dead Alliance
END:VEVENT
BEGIN:VEVENT
UID:36@chrisgregori.co.uk/playdate
DTSTART:20170829T000001Z
DTEND:20170829T000002Z
SUMMARY:Everybody's Golf
END:VEVENT
BEGIN:VEVENT
UID:37@chrisgregori.co.uk/playdate
DTSTART:20170829T000001Z
DTEND:20170829T000002Z
SUMMARY:Mario + Rabbids: Kingdom Battle
END:VEVENT
BEGIN:VEVENT
UID:38@chrisgregori.co.uk/playdate
DTSTART:20170831T000001Z
DTEND:20170831T000002Z
SUMMARY:Last Day of June
END:VEVENT
BEGIN:VEVENT
UID:39@chrisgregori.co.uk/playdate
DTSTART:20170831T000001Z
DTEND:20170831T000002Z
SUMMARY:Life Is Strange: Before the Storm
END:VEVENT
BEGIN:VEVENT
UID:40@chrisgregori.co.uk/playdate
DTSTART:20170901T000001Z
DTEND:20170901T000002Z
SUMMARY:a nifty game
END:VEVENT
BEGIN:VEVENT
UID:41@chrisgregori.co.uk/playdate
DTSTART:20170905T000001Z
DTEND:20170905T000002Z
SUMMARY:Knack II
END:VEVENT
BEGIN:VEVENT
UID:42@chrisgregori.co.uk/playdate
DTSTART:20170906T000001Z
DTEND:20170906T000002Z
SUMMARY:Destiny 2
END:VEVENT
BEGIN:VEVENT
UID:43@chrisgregori.co.uk/playdate
DTSTART:20170906T000001Z
DTEND:20170906T000002Z
SUMMARY:Beyond the Void
END:VEVENT
BEGIN:VEVENT
UID:44@chrisgregori.co.uk/playdate
DTSTART:20170912T000001Z
DTEND:20170912T000002Z
SUMMARY:Inside / Limbo
END:VEVENT
BEGIN:VEVENT
UID:45@chrisgregori.co.uk/playdate
DTSTART:20170914T000001Z
DTEND:20170914T000002Z
SUMMARY:Divinity: Original Sin II
END:VEVENT
BEGIN:VEVENT
UID:46@chrisgregori.co.uk/playdate
DTSTART:20170914T000001Z
DTEND:20170914T000002Z
SUMMARY:Pro Evolution Soccer 2018
END:VEVENT
BEGIN:VEVENT
UID:47@chrisgregori.co.uk/playdate
DTSTART:20170915T000001Z
DTEND:20170915T000002Z
SUMMARY:Dishonored: Death of the Outsider
END:VEVENT
BEGIN:VEVENT
UID:48@chrisgregori.co.uk/playdate
DTSTART:20170915T000001Z
DTEND:20170915T000002Z
SUMMARY:Metroid: Samus Returns
END:VEVENT
BEGIN:VEVENT
UID:49@chrisgregori.co.uk/playdate
DTSTART:20170915T000001Z
DTEND:20170915T000002Z
SUMMARY:The Meridian Shard
END:VEVENT
BEGIN:VEVENT
UID:50@chrisgregori.co.uk/playdate
DTSTART:20170919T000001Z
DTEND:20170919T000002Z
SUMMARY:NBA 2K18
END:VEVENT
BEGIN:VEVENT
UID:51@chrisgregori.co.uk/playdate
DTSTART:20170919T000001Z
DTEND:20170919T000002Z
SUMMARY:Marvel vs. Capcom: Infinite
END:VEVENT
BEGIN:VEVENT
UID:52@chrisgregori.co.uk/playdate
DTSTART:20170922T000001Z
DTEND:20170922T000002Z
SUMMARY:Project CARS 2
END:VEVENT
BEGIN:VEVENT
UID:53@chrisgregori.co.uk/playdate
DTSTART:20170928T000001Z
DTEND:20170928T000002Z
SUMMARY:Total War: Warhammer II
END:VEVENT
BEGIN:VEVENT
UID:54@chrisgregori.co.uk/playdate
DTSTART:20170928T000001Z
DTEND:20170928T000002Z
SUMMARY:Occultic;Nine
END:VEVENT
BEGIN:VEVENT
UID:55@chrisgregori.co.uk/playdate
DTSTART:20170928T000001Z
DTEND:20170928T000002Z
SUMMARY:Eiyuu Densetsu: Sen no Kiseki III
END:VEVENT
BEGIN:VEVENT
UID:56@chrisgregori.co.uk/playdate
DTSTART:20170929T000001Z
DTEND:20170929T000002Z
SUMMARY:FIFA 18
END:VEVENT
BEGIN:VEVENT
UID:57@chrisgregori.co.uk/playdate
DTSTART:20170929T000001Z
DTEND:20170929T000002Z
SUMMARY:Cuphead
END:VEVENT
BEGIN:VEVENT
UID:58@chrisgregori.co.uk/playdate
DTSTART:20170929T000001Z
DTEND:20170929T000002Z
SUMMARY:Star Fox 2
END:VEVENT
BEGIN:VEVENT
UID:59@chrisgregori.co.uk/playdate
DTSTART:20171003T000001Z
DTEND:20171003T000002Z
SUMMARY:Forza Motorsport 7
END:VEVENT
BEGIN:VEVENT
UID:60@chrisgregori.co.uk/playdate
DTSTART:20171006T000001Z
DTEND:20171006T000002Z
SUMMARY:Mario & Luigi: Superstar Saga + Bowser's Minions
END:VEVENT
BEGIN:VEVENT
UID:61@chrisgregori.co.uk/playdate
DTSTART:20171010T000001Z
DTEND:20171010T000002Z
SUMMARY:Middle-earth: Shadow of War
END:VEVENT
BEGIN:VEVENT
UID:62@chrisgregori.co.uk/playdate
DTSTART:20171013T000001Z
DTEND:20171013T000002Z
SUMMARY:The Evil Within 2
END:VEVENT
BEGIN:VEVENT
UID:63@chrisgregori.co.uk/playdate
DTSTART:20171013T000001Z
DTEND:20171013T000002Z
SUMMARY:WWE 2K18
END:VEVENT
BEGIN:VEVENT
UID:64@chrisgregori.co.uk/playdate
DTSTART:20171017T000001Z
DTEND:20171017T000002Z
SUMMARY:South Park: The Fractured But Whole
END:VEVENT
BEGIN:VEVENT
UID:65@chrisgregori.co.uk/playdate
DTSTART:20171017T000001Z
DTEND:20171017T000002Z
SUMMARY:ELEX
END:VEVENT
BEGIN:VEVENT
UID:66@chrisgregori.co.uk/playdate
DTSTART:20171024T000001Z
DTEND:20171024T000002Z
SUMMARY:Just Dance 2018
END:VEVENT
BEGIN:VEVENT
UID:67@chrisgregori.co.uk/playdate
DTSTART:20171027T000001Z
DTEND:20171027T000002Z
SUMMARY:Wolfenstein II: The New Colossus
END:VEVENT
BEGIN:VEVENT
UID:68@chrisgregori.co.uk/playdate
DTSTART:20171027T000001Z
DTEND:20171027T000002Z
SUMMARY:Assassin's Creed Origins
END:VEVENT
BEGIN:VEVENT
UID:69@chrisgregori.co.uk/playdate
DTSTART:20171027T000001Z
DTEND:20171027T000002Z
SUMMARY:Super Mario Odyssey
END:VEVENT
BEGIN:VEVENT
UID:70@chrisgregori.co.uk/playdate
DTSTART:20171107T000001Z
DTEND:20171107T000002Z
SUMMARY:Super Lucky's Tale
END:VEVENT
BEGIN:VEVENT
UID:71@chrisgregori.co.uk/playdate
DTSTART:20171110T000001Z
DTEND:20171110T000002Z
SUMMARY:Ni no Kuni II: Revenant Kingdom
END:VEVENT
BEGIN:VEVENT
UID:72@chrisgregori.co.uk/playdate
DTSTART:20171110T000001Z
DTEND:20171110T000002Z
SUMMARY:Need for Speed Payback
END:VEVENT
BEGIN:VEVENT
UID:73@chrisgregori.co.uk/playdate
DTSTART:20171114T000001Z
DTEND:20171114T000002Z
SUMMARY:Lego Marvel Super Heroes 2
END:VEVENT
BEGIN:VEVENT
UID:74@chrisgregori.co.uk/playdate
DTSTART:20171117T000001Z
DTEND:20171117T000002Z
SUMMARY:Pokemon Ultra Sun / Ultra Moon
END:VEVENT
BEGIN:VEVENT
UID:75@chrisgregori.co.uk/playdate
DTSTART:20171117T000001Z
DTEND:20171117T000002Z
SUMMARY:Star Wars Battlefront II
END:VEVENT
BEGIN:VEVENT
UID:76@chrisgregori.co.uk/playdate
DTSTART:20171130T000001Z
DTEND:20171130T000002Z
SUMMARY:Little Witch Academia: Toki no Maho to Nana Fushigi
END:VEVENT
BEGIN:VEVENT
UID:77@chrisgregori.co.uk/playdate
DTSTART:20171230T000001Z
DTEND:20171230T000002Z
SUMMARY:Bacon Man: An Adventure
END:VEVENT

END:VCALENDAR`;

const can = {
  posts: p(privileges.posts.can),
  topics: p(privileges.topics.can),
  categories: p(privileges.categories.can),
};
const tidFromPid = p((pid, cb) => posts.getPostField(pid, 'tid', cb));
const topicIsDeleted = p((tid, cb) => topics.getTopicField(tid, 'deleted', cb));
const doRequest = async (options) => {
  return new Promise ((resolve, reject) => {
    let req = require('http').request(options);
    req.on('response', res => {
      resolve(res);
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = (sock, data, cb) => {
  (async ({ uid }, { pid, tid, cid, isMain }) => {
    if (!isMain && await getSetting('mainPostOnly')) {
      return false;
    }

    if (pid) {
      return can.posts(privilegeNames.canPost, pid, uid);
    }
    if (tid) {
      return can.topics(privilegeNames.canPost, tid, uid);
    }
    if (cid) {
      return can.categories(privilegeNames.canPost, cid, uid);
    }
    return false;
  })(sock, data).asCallback(cb);
};

pluginSockets.calendar.getResponses = ({ uid }, { pid, day }, cb) => {
  getAllResponses({ uid, pid, day }).asCallback(cb);
};

pluginSockets.calendar.submitResponse = ({ uid }, { pid, value, day } = {}, cb) => {
  submitResponse({ uid, pid, value, day }).asCallback(cb);
};

pluginSockets.calendar.getUserResponse = ({ uid }, { pid, day }, cb) => {
  getUserResponse({ uid, pid, day }).asCallback(cb);
};

pluginSockets.calendar.getEventsByDate = (sock, data, cb) => {
  (async ({ uid }, { startDate, endDate }) => {
    const events = await getEventsByDate(startDate, endDate);
    const filtered = await filterByPid(events, uid);
    const occurences = filtered.reduce((prev, event) => {
      if (event.repeats && event.repeats.every) {
        return [...prev, ...getOccurencesOfRepetition(event, startDate, endDate)];
      }
      return [...prev, event];
    }, []);
    const withResponses = await Promise.all(
      occurences.map(async (event) => {
        const day = event.day;
        const [response, topicDeleted, escaped] = await Promise.all([
          getUserResponse({ pid: event.pid, uid, day }).catch(() => null),
          tidFromPid(event.pid).then(topicIsDeleted),
          escapeEvent(event),
        ]);
        return {
          ...escaped,
          responses: {
            [uid]: response,
          },
          topicDeleted: !!parseInt(topicDeleted, 10),
        };
      })
    );
    // const iCals = ['http://www.chrisgregori.co.uk/playdate/export.php'];
    // const remote = await Promise.all(
    //   iCals.map(async (url) => {
    //     iCal = await doRequest(url);
    //     console.log(iCal);
    //     return iCal;
    //   })
    // );
    const jcalData = ICAL.parse(iCal);
    const vcalendar = new ICAL.Component(jcalData);
    const remote = await Promise.all(
      vcalendar.getAllSubcomponents('vevent').filter((vevent) => {
        const dtstart = vevent.getFirstPropertyValue('dtstart');
        const dtend = vevent.getFirstPropertyValue('dtend');

        return (dtstart.toUnixTime() + '000') >= startDate && (dtend.toUnixTime() + '999') <= endDate;
      }).map(async (vevent) => {
        const summary = vevent.getFirstPropertyValue('summary');
        const dtstart = vevent.getFirstPropertyValue('dtstart');
        const dtend = vevent.getFirstPropertyValue('dtend');

        return {
          allday: true,
          cid: "2",
          day: dtstart.toString().substring(0,10),
          description: "<p>Game Release</p>\n",
          endDate: Number(dtend.toUnixTime() + '999'),
          location: "",
          mandatory: true,
          name: summary,
          pid: 0,
          reminders: [],
          responses: {},
          startDate: Number(dtstart.toUnixTime() + '000'),
          topicDeleted: false,
          uid: 1
        }
      })
    );

    // return [...withResponses];
    return [...withResponses, ...remote];
  })(sock, data).asCallback(cb);
};
