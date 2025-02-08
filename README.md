# Card Collectors

A React-based web application for card collecting enthusiasts, using Firebase for authentication and storage.

## Features

- Google Authentication
- Card Collection Management
- Card Gallery
- User Profiles

## Tech Stack

- React
- Firebase (Auth, Firestore, Storage)
- Material-UI (for styling)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update the Firebase configuration values
4. Run the development server: `npm start`

## Project Structure

### TODO

- get google login working
- set up s3 bucket for image storage
- set up db to store user collection data
- set up api to return card info
- set up frontend to display card info
- set up way for admin to add cards to db


### TODO for prd
 - edit CORS on s3 bucket with real prd domain


Set up an S3 bucket with proper CORS configuration
Create a function to get presigned URLs for direct upload to S3
Store image metadata in a database (Firebase Firestore could work well for this)
Add an image grid to display uploaded images
Add image deletion functionality