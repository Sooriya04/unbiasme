# 🧠 UnbiasMe

**UnbiasMe** is a psychology-based web application that helps users discover their **personality traits** and **cognitive biases** through an interactive quiz. The platform blends structured assessment with AI-powered insights to promote self-awareness, personal growth, and decision-making clarity.

---

## 🔍 Features

- ✅ **Secure Authentication**: User registration, login, and session handling
- 📧 **Email Verification**: Protects users and confirms account authenticity
- 🧠 **Personality & Bias Quiz**: Curated questions based on psychological models and research
- 📊 **Result Dashboard**: Visual feedback on trait percentage scores
- 🤖 **Gemini AI Integration**: Validates user responses and generates smart feedback
- 🔁 **Resend Verification**: Option to resend email if not received
- 💡 **Dynamic Question Loading**: Quiz questions fetched and rendered via JavaScript
- 🌐 **Fully Responsive Design**: Smooth experience on desktop, tablet, and mobile
- 💾 **MongoDB Storage**: Efficient storage of users, results, and responses

---

## 🛠️ Technologies Used

| Layer        | Tech Stack                      |
|--------------|---------------------------------|
| **Frontend** | HTML, CSS, EJS, Bootstrap       |
| **Backend**  | Node.js, Express.js             |
| **Database** | MongoDB with Mongoose ORM       |
| **AI Layer** | Google Gemini API (2.0 Flash)   |
| **Auth**     | Session-based login system      |
| **Emailing** | Nodemailer (SMTP via Gmail)     |

---

## 🚀 Getting Started

## 1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/UnbiasMe.git
   ```
   ````bash
   cd UnbiasMe
   ````
## 2. Install Dependencies
```bash
npm install
```
## 3. Create a .env File
`````
MONGODB_URI = Db_url
AUTH_EMAIL = your_mail
AUTH_PASS = app_secret_key
GEMINI_API_KEY = your api
SESSION_SECRET = session_secert_id
`````

## 4. Run the App
```
npm start
```
---

## 🔐 Security Notes

- Never push `.env` or sensitive keys to GitHub.
- Always hash passwords (already handled with **bcrypt**).
- Use **HTTPS** for production.

---

## 🧪 Future Enhancements

- 📈 **Analytics** for user traits over time  
- 🧩 **More advanced quizzes** based on MBTI and Big Five  
- 🌍 **Multilingual support**  
- 🎯 **Career recommendations** based on personality  
- 🗂 **Admin panel** to manage questions and users

## 📬 Contact

For queries, suggestions, or collaboration:

- 🌐 **Website**: [sooriya04.github.io/sooriya](https://sooriya04.github.io/sooriya/)
- 📧 **Email**: [sooriya.work@gmail.com](mailto:sooriya.work@gmail.com)
- 💻 **GitHub**: [github.com/Sooriya04](https://github.com/Sooriya04)

