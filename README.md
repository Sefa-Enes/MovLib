
### My First Project with React-Native!

This is a simple and interactive mobile application built using React Native and Expo. The app fetches popular movies, search results, and movie details using the TMDB (The Movie Database) API. The goal of this project is to learn mobile app development with Expo, API integration, and component-based architecture. It also uses a storage system based on SQLite for mobile versions and json for web versions to keep track of the shows you watched. 

📋 Requirements
• Node.js (LTS recommended)
• Expo CLI
• Git (optional)
• A TMDB account and API key

🚀 Setup
1. Clone or download the repository:
```bash
git clone https://github.com/Sefa-Enes/MovLib
cd MovLib
```

2. Install dependencies:
```bash
npm install
```

3. Get your TMDB API Key:
• Go to the TMDB Developer Portal.
• Create an account and generate a v3 API key.
• Create a .env file in the project root.
• Add your key as follows:

```typescript
EXPO_PUBLIC_MOVIE_API_KEY=your_api_key_here
```
> [!WARNING]
> Be careful not to share your API key on anywhere. .env file is already in the gitignore but you be careful though.

📱 Running the App
4. Use the Expo Go app to run the project on a physical device or emulator.

• Start the development server:
```bash
npx expo start
```


<details>

<summary>For Mobile Platform Testing:</summary>

```
Install Expo Go app on your mobile device.
Scan the QR code:
Open the Expo Go app.
Scan the QR code displayed in your terminal.
The app will load instantly.

```

</details>
<details>

<summary>For Web Platform Testing:</summary>

```
Open the http://localhost:8081/ or the adress Expo gives you in the terminal
You can use dev tools (F12 or CTRL+Shift+J) mobile emulation tool to simulate mobile experience.

```

</details>
