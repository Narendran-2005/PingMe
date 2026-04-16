# PingMe Demo Runbook

## 1. Pre-demo Checklist
- [ ] Connect PC and mobile device to the same WiFi network, or ensure `ngrok` is running.
- [ ] Start MySQL server (ensure `pingme` database exists).
- [ ] Ensure `jwt.secret` is properly set with a base64 encoded string in `backend/src/main/resources/application.properties`.
- [ ] Initialize the database with demo seed data:
  ```bash
  mysql -u root -p pingme < demo_seed.sql
  ```
- [ ] Run the **Backend**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
- [ ] Run `ngrok http 8080` (if testing over cellular) OR grab your local IPv4 address.
- [ ] Update **Frontend Config**: Edit `frontend/src/constants/config.ts` replacing `SERVER_HOST` with your `ngrok` domain or local IPv4.
- [ ] Run the **Frontend**:
  ```bash
  cd frontend
  npx expo start
  ```
- [ ] Scan the Expo QR code using Expo Go on the physical Android/iOS device.

## 2. Demo Script
1. Open the PingMe app on the physical device. You'll see the quantum-safe splash screen.
2. Login as **ajay** with password **Demo@1234**.
3. **Home Screen**: Show the split layout containing Direct Messages and Group chats, demonstrating the bottom active user tray.
4. **Direct Messaging**: Tap into the direct chat with *bala*. Scroll up to show the seeded message history.
5. **Real-time Delivery**: Send a new message "Just logging in for the demo now!". 
6. **PQ Signatures**: Explicitly point out the tiny "PQ-signed" shield icon with the green tick mark beside the message timestamp. This verifies signature transmission.
7. **Switch Devices**: Open the app on a second device (or emulator) and login as **bala** (Demo@1234).
8. **Live Interaction**: Show the real-time delivery and the online status dots changing from offline to green.
9. **Groups Live Demo**: Tap the "+" icon as *bala* to create a new group.
   - Name it "Demo Squad".
   - Select multiple users. Show the animated selected user chips scaling in and out.
   - Send the first message to the group.
10. **Profile Customization**: Tap the profile button in the bottom left. 
    - Change your display name.
    - Select a new avatar color and demonstrate the realtime bounce animation and success checkmark.
    - Change your status to "AWAY".

## 3. Talking Points
- **WebSocket Real-time Delivery**: Messages are pushed out via Spring WebSockets with STOMP, ensuring sub-second delivery to all connected clients without HTTP polling.
- **JWT Stateless Auth**: We keep our servers highly scalable. State is managed purely by the clients; every REST request is secured by the token.
- **Dilithium PQ-Signatures**: 
  - To respect current architectural best-practices around fragile hybrid edge modules (like JS/WASM React constraints), we fully shifted native implementation correctly directly out to the Spring Boot instance. Our backend handles generating native pure-Java KeyPairs and executes rapid Dilithium hashing reliably and securely!
- **MySQL Persistence**: Ensure everyone understands data survives app clears because it's hosted securely in the AWS/local instance.
- **Data Model**: Briefly note how Conversation models combine constraints seamlessly to handle both Direct mapping or dynamic Groups.

## 4. Troubleshooting During Demo
- **"Network Error" on login**: The app cannot reach the Spring setup. Double check `config.ts` vs your actual tunnel/IP. 
- **Messages don't arrive in real-time**: Check the terminal. If WebSocket disconnected, verify your network isn't blocking WebSocket ports. Force close the app and re-open.
- **"User not found" on login**: You forgot to run `demo_seed.sql`! Hook up to MySQL and run the seed script to enable the `Demo@1234` logins.
