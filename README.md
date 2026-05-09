# NewsXpress

A full-stack news web application that fetches real-time news, stores it in MongoDB, and serves it through a responsive frontend.

## Features

* Fetches news using an external API
* Implements MongoDB caching to reduce API calls
* Contact form with email integration
* Backend built with Express.js

## Tech Stack

* Node.js
* Express.js
* MongoDB
* HTML, CSS, JavaScript

## Setup Instructions

1. Clone the repository

2. Install dependencies
   npm install

3. Create a `.env` file with the following:
   PORT=your_port
   MONGO_URI=your_mongo_uri
   NEWS_API_KEY=your_api_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_password

4. Run the server
   npm start

note:- api should be from this website https://newsapi.org 
       otherwise, if taken another u should have to make some changes in order to run your code.

## Author

Goransh
