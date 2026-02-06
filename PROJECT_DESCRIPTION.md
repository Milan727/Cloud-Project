# Project Description: SkyStore - Personal Secure Cloud Storage

## Project Overview
SkyStore is a robust, full-stack cloud storage application designed to provide users with a secure and intuitive platform for managing their personal files. Built with a focus on data privacy and user experience, the application leverages the power of serverless architecture to ensure scalability and reliability.

## Key Features
- **Secure Authentication**: Implemented a comprehensive authentication system using **Firebase Auth**, supporting both traditional Email/Password login and **Google OAuth** for seamless onboarding.
- **User Data Isolation**: Engineered a strict data isolation model using **Cloud Firestore**. Each user interacts only with their own data, secured by backend rules and frontend filtering.
- **Cloud Storage Integration**: Integrated **AWS S3** for reliable, scalable file storage. Utilized **Signed URLs** to ensure secure, temporary access to private files.
- **Real-time Dashboard**: Developed a responsive dashboard where users can view their file history, upload new files with progress indicators, rename files (updating metadata in Firestore), and delete files permanently from both the database and cloud storage.
- **Modern UI/UX**: Designed a clean, professional interface using CSS3 and HTML5, featuring responsive layouts, loading states, and clear feedback for user actions.

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend / BaaS**: Firebase (Authentication, Firestore Database)
- **Storage**: AWS S3 (Simple Storage Service)
- **Tools**: Git, GitHub, VS Code

## Technical Challenges Solved
- **Synchronizing State**: Solved the challenge of keeping the UI syncronized with two independent cloud services (AWS S3 for blobs and Firestore for metadata) by implementing robust transactional logic in the frontend.
- **Security**: Mitigated security risks by moving sensitive credentials to environment configurations and implementing signed URL generation for file access.
