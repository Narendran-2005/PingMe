# PingMe Environment Setup & Execution Instructions

This file guides you through spinning up your freshly migrated PingMe chat environment, combining the fully reactive Expo frontend with the Spring Boot logic handling the native Post-Quantum Bouncy Castle cryptography. 

### Step 1: Initialize Database Setup 

Our migration added cryptographic properties to the structure (`signatures`). You must clear constraints and map the newest profiles seamlessly:

1. Ensure your MySQL server (running on port `3306`) is functional.
2. In your backend folder (`backend/src/main/resources/application.properties`), make sure `spring.jpa.hibernate.ddl-auto=update` is set so Spring handles applying the new schema columns cleanly. 
3. *After* checking the schema configs, seed the clean data into the local instance over terminal:
   ```bash
   mysql -u root -p pingme < demo_seed.sql
   ```
   *(This cleanly truncates out old conflicting structures and natively rebuilds `ajay`, `bala`, `chandra`, and `dinesh` accounts).*

### Step 2: Start the Spring Boot Backend

1. In a terminal, navigate securely to the `backend/` directory.
2. Start the application natively via Maven wrapper:
   ```bash
   mvn clean spring-boot:run
   ```
3. Watch the console closely during initialization! Because of our seamless `@PostConstruct` cache feature, memory allocates successfully without a hitch immediately:
   > `Initialising Dilithium keys for seed users`
   > `Dilithium key ready for user: ajay`
   This guarantees your seed demo characters automatically possess their PQ key pairs locally memory-mapped without failing offline constraints!

### Step 3: Start the React Native Frontend

1. Ensure your local machine's IP address (e.g. `192.168.1.5`) or your robust `ngrok` URL target is correctly targeted inside your `frontend/src/constants/api.ts` or `config.ts` mapping. The STOMP client relies exclusively on this map to ping the WebSocket pipeline securely.
2. Open a separate terminal mapping directly to the `frontend/` directory.
3. Because we heavily modified `package.json` to revert unsupportable native cryptography dependencies, scrub and sync your node-modules:
   ```bash
   npm install
   ```
4. Start the interactive Expo server natively bypassing cached architecture limits:
   ```bash
   npx expo start -c
   ```
   *(The `-c` flag ensures the Metro cache actively wipes native bindings caching the previously erroring `react-native-kyber`).*
5. Scan the QR code precisely generated over terminal via **Expo Go** running natively on your Android setup (or interact directly pressing `a` via keyboard to emulate an Android virtual device).

### Step 4: Run the Demo Flow!

Everything is functionally integrated correctly.

- **Login**: Use Seed Identity `ajay` and Demo Password `Demo@1234`.
- **Chat**: Enter the `Final year Project` chat and freely type messages. The Spring Boot backend safely intercepts the payload internally, binds the Dilithium byte array seamlessly using `DILITHIUM3` constraints, and immediately broadcasts verified configurations. 
- **Observe**: Notice the UI smoothly rendering the **PQ-signed** verification tick seamlessly without stressing your edge-device!
