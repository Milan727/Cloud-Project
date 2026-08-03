# ☁️ SkyStore — Secure Cloud Storage Platform

SkyStore is a secure, full-stack cloud storage application designed to provide users with a private and intuitive platform for managing their personal files. Built with a focus on data privacy, data isolation, and user experience, the application leverages serverless architecture to ensure scalability and reliability.

---

## 🌟 Key Features

*   **🔒 Secure Authentication**: Multi-method authentication system powered by **Firebase Auth**, supporting traditional Email/Password credentials and **Google OAuth** for quick sign-in.
*   **📂 Rigid User Data Isolation**: Strict user-level isolation using **Cloud Firestore** security rules. Each user can only read, write, and view their own private metadata.
*   **☁️ AWS S3 File Storage Integration**: Leverages **AWS S3 (Simple Storage Service)** for high-availability file hosting, utilizing secure **Signed URLs** to guarantee temporary access permissions to stored files.
*   **📊 Real-time Dashboard Panel**: Interactive frontend workspace to upload new files (with progress indicators), rename files (updating DB metadata), and delete items from both AWS S3 and Firestore database simultaneously.
*   **📱 Modern Responsive UI/UX**: Clean, professional interface styled with custom CSS3 variables, complete loading states, and dynamic status notifications.

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3 Variables, JavaScript (ES6 Modules)
*   **BaaS / Database**: Firebase v9 (Auth, Cloud Firestore)
*   **Cloud Infrastructure**: AWS S3 (Simple Storage Service)
*   **Hosting / CI/CD**: Vercel

---

## 📦 Project Structure

```
├── Index.html           # Main dashboard UI page
├── login.html           # Secure User Login page
├── signup.html          # New Account Signup page
├── style.css            # Custom responsive styles and layout rules
├── script.js            # Frontend application logic and API integrations
├── auth.js              # Firebase authentication wrappers
├── firebase-config.js   # Client-side Firebase credentials
├── firestore-db.js      # Firestore database read/write actions
└── vercel.json          # Deployment clean URL configuration
```

---

## ⚙️ Environment Configurations

The project builds statically for deployment using the following configuration environment variables injected during the CI/CD build step:

```env
MY_AWS_REGION=<your-aws-region>
MY_AWS_BUCKET_NAME=<your-s3-bucket-name>
MY_AWS_ACCESS_KEY=<your-aws-access-key-id>
MY_AWS_SECRET_KEY=<your-aws-secret-access-key>
```
