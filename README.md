# MoodyBlu 🎵

**Discover music and movies that perfectly match your vibe. MoodyBlu is a web application that uses AI to recommend content based on your mood and allows you to collaborate with friends in real-time.**

---

## ✨ About The App

MoodyBlu is designed to provide a personalized and collaborative entertainment experience. Whether you're looking for something to watch by yourself or want to build the perfect party playlist with friends, MoodyBlu has you covered.

The core of the application is its ability to understand user preferences, either through direct mood detection or by analyzing group tastes, to provide highly relevant content recommendations.

## 🚀 Key Features

* **👤 User Authentication**: Secure signup and login system with email verification, OTPs, and password reset functionality.
* **🙂 Mood-Based Recommendations**: Utilizes AI to analyze user moods and suggest relevant movies.
* **🌐 Collaborative Blend Rooms**:
    * Create private rooms to invite friends.
    * Build shared playlists in real-time.
    * Chat with participants within the room.
    * Get group recommendations based on the combined tastes of everyone in the Blend.
* **💬 Real-time Chat & Notifications**: A fully-featured chat system within Blend rooms and real-time toast notifications for invites and other events, all powered by WebSockets.
* **🎶 Personal & Shared Playlists**: Users can create and manage their own private playlists on their dashboard or contribute to collaborative playlists in a Blend.
* **🎨 Modern & Responsive UI**: A sleek, animated user interface built with a dark theme, ensuring a great experience on any device.

---

## 💻 Tech Stack

This project is built with a modern, full-stack JavaScript toolset.

* **Frontend**:
    * **Framework**: [Next.js](https://nextjs.org/) (React)
    * **Styling**: [Tailwind CSS](https://tailwindcss.com/)
    * **Animation**: [Framer Motion](https://www.framer.com/motion/)
    * **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
    * **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
    * **Face Detection**: [face-api.js](https://github.com/justadudewhohacks/face-api.js)
* **Backend**:
    * **Framework**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/) (or your chosen backend framework)
    * **Database**: [MongoDB](https://www.mongodb.com/) (likely, with Mongoose)
    * **Real-time Communication**: [Socket.IO](https://socket.io/)
* **Deployment & Assets**:
    * **Image Hosting**: [Cloudinary](https://cloudinary.com/)

---

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn
* A running instance of the backend server (Node.js/Express)
* A MongoDB database instance

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/moodyblu.git](https://github.com/your-username/moodyblu.git)
    cd moodyblu
    ```

2.  **Install frontend dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add the necessary environment variables, such as your backend API URL.
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Folder Structure

The project follows a standard Next.js `app` directory structure.


/
├── app/
│   ├── (auth)/             # Route group for authentication pages
│   │   ├── auth/
│   │   ├── forgot/
│   │   ├── reset-password/
│   │   └── verify/
│   ├── blend/
│   │   └── [roomId]/       # Dynamic route for Blend rooms
│   ├── dashboard/          # User's main dashboard
│   ├── components/         # Reusable components (Sidebar, Carousel, etc.)
│   ├── context/            # React Context providers (UserContext, etc.)
│   ├── lib/                # Utility files (socket.js, etc.)
│   └── layout.js           # Main app layout
│   └── page.js             # Landing page
├── public/                 # Static assets (images, fonts)
├── next.config.js          # Next.js configuration
└── tailwind.config.js      # Tailwind CSS configuration


---

Thank you for checking out MoodyBlu!
