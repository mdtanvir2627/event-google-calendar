const express = require("express");
const { google } = require("googleapis");

require("dotenv").config();

const app = express();

const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// console.log( GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_PROJECT_NUMBER, GOOGLE_CALENDAR_ID);

const jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
  SCOPES
);

const calendar = google.calendar({
  version: "v3",
  project: GOOGLE_PROJECT_NUMBER,
  auth: jwtClient,
});

app.get("/", (req, res) => {
  calendar.events.list(
    {
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (error, result) => {
      if (error) {
        res.send(JSON.stringify({ error: error }));
      } else {
        if (result.data.items.length) {
          res.send(JSON.stringify({ events: result.data.items }));
        } else {
          res.send(
            JSON.stringify({ message: "No upcoming events found." }, null, 2)
          );
        }
      }
    }
  );
});

app.get("/createEvent", (req, res) => {
  var event = {
    summary: "SquadDeck first event!",
    location: "Bogura, Bangladesh",
    description: "SquadDeck event with nodeJS!",
    start: {
      dateTime: "2024-03-18T09:00:00-07:00",
      timeZone: "Asia/Dhaka",
    },
    end: {
      dateTime: "2024-03-21T17:00:00-07:00",
      timeZone: "Asia/Dhaka",
    },
    // attendees: [{ email: "tuhin.netmow@gmail.com" }],
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const auth = new google.auth.GoogleAuth({
    keyFile: "squaddeck-calendar-event-659d1f5cef7d.json",
    scopes: "https://www.googleapis.com/auth/calendar",
  });

  auth.getClient().then((a) => {
    calendar.events.insert(
      {
        auth: a,
        calendarId: GOOGLE_CALENDAR_ID,
        resource: event,
      },
      function (err, event) {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return;
        }
        console.log("Event created: %s", event.data);
        res.jsonp("Event successfully created!");
      }
    );
  });
});

app.listen(3300, () => console.log(`App listening on http://localhost:3300!`));
