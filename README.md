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

- set up dalle api to merge 2 images into 1 with additional prompts
- once card image is created, store in s3 and add to users collection as a card
- set up frontend to display card info
- ability to trade cards with other users on a marketplace
- 3d card models
- site styling

### Maybe?

- smooth transitions between pages

### TODO for prd

- edit CORS on s3 bucket with real prd domain
