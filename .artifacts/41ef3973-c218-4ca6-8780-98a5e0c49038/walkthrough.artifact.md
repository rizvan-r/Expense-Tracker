# SpendAI Mobile App Walkthrough

I have developed a full-featured Android mobile application for **SpendAI**, integrating the existing FastAPI backend and Supabase infrastructure. The app is located in a new folder: `I:/Richu/Projects/SpendAIMobile`.

## Key Features Implemented

### 1. Authentication & Security
- **Supabase Auth Integration**: Users can sign up and log in securely.
- **Project Credentials**: Configured with the SpendAI Supabase project URL and Anon Key.
- **File**: [SupabaseModule.kt](file:///I:/Richu/Projects/SpendAIMobile/app/src/main/kotlin/com/spendai/mobile/data/SupabaseModule.kt)

### 2. Intelligent Dashboard
- **Financial Health Score**: Fetches a 0-100 score from the ML-powered backend.
- **Budget Prediction**: Displays linear regression forecasts (Safe vs. Caution) for monthly spending.
- **Glassmorphic UI**: High-contrast, dark-mode design with the "Eye of Providence" aesthetic.
- **File**: [DashboardScreen.kt](file:///I:/Richu/Projects/SpendAIMobile/app/src/main/kotlin/com/spendai/mobile/ui/screens/DashboardScreen.kt)

### 3. Expense Management
- **Manual Entry & List**: View, add, and delete expenses directly synced with Supabase PostgreSQL.
- **Receipt OCR (CameraX)**: Take photos of receipts and upload them to the FastAPI `/api/ocr/upload` endpoint for automatic extraction.
- **Files**: [ExpenseListScreen.kt](file:///I:/Richu/Projects/SpendAIMobile/app/src/main/kotlin/com/spendai/mobile/ui/screens/ExpenseListScreen.kt), [CameraScreen.kt](file:///I:/Richu/Projects/SpendAIMobile/app/src/main/kotlin/com/spendai/mobile/ui/screens/CameraScreen.kt)

### 4. AI Financial Assistant
- **Conversational AI**: A dedicated chat screen to interact with the SpendAI bot (GPT-4o/Llama-3 based).
- **Context Aware**: Interactions are routed through the FastAPI backend to provide personalized financial coaching.
- **File**: [ChatScreen.kt](file:///I:/Richu/Projects/SpendAIMobile/app/src/main/kotlin/com/spendai/mobile/ui/screens/ChatScreen.kt)

## Technical Stack
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Database/Auth**: Supabase Kotlin SDK
- **Networking**: Ktor Client (integrated with FastAPI at `10.0.2.2:8000`)
- **Dependency Injection**: Hilt
- **Image Capture**: CameraX

## Verification Results
- All files have been created in the specified directory: `I:/Richu/Projects/SpendAIMobile`.
- Code structure follows modern Android MVVM best practices.
- Integration points match the provided `.env` and `main.py` endpoints.

---
> [!TIP]
> To run the app:
> 1. Open `I:/Richu/Projects/SpendAIMobile` in Android Studio.
> 2. Ensure your FastAPI backend is running locally.
> 3. Use an Android Emulator (accessible via `10.0.2.2`).
