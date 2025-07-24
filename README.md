# 🎪 Bill Splitter - Split Bills Like a Party!

A beautiful, colorful full-stack web application for splitting bills and expenses among friends! Create events, add expenses, and see exactly who owes what - all with an engaging, party-themed interface.

## 🌟 Live Demo

**🎨 Frontend:** [https://billsplitter-production-d8f2.up.railway.app/](https://billsplitter-production-d8f2.up.railway.app/)  
**🔧 Backend API:** [https://billsplitter-production.up.railway.app/](https://billsplitter-production.up.railway.app/)

> Try it now! Create an event, add friends, split some bills! 🎉

## ✨ Features

### 🎨 **Beautiful & Colorful UI**
- Vibrant gradient backgrounds
- Smooth animations and hover effects
- Glass-morphism design elements
- Mobile-responsive interface
- Emoji-rich visual indicators

### 💰 **Smart Bill Splitting**
- Create shareable events with unique IDs
- Add multiple people to any event
- Track expenses with detailed descriptions
- Flexible splitting (everyone or specific people)
- Automatic balance calculations
- Optimized settlement suggestions

### 🔄 **Real-Time Collaboration**
- Multiple users can join the same event
- Live updates across all participants
- Shareable event links
- No registration required

### 📱 **Cross-Platform**
- Works on desktop, tablet, and mobile
- Progressive web app capabilities
- Fast loading and smooth performance

## 🛠️ Tech Stack

### Frontend
- **React** (Create React App)
- **JavaScript ES6+**
- **Lucide React** (Icons)
- **CSS3** with gradients and animations
- **Responsive Design**

### Backend  
- **Python Flask** (REST API)
- **SQLAlchemy** (ORM)
- **SQLite** (Development) / **PostgreSQL** (Production)
- **Flask-CORS** (Cross-origin requests)

### Deployment
- **Railway** (Backend hosting)
- **Railway** (Frontend hosting)
- **GitHub** (Version control)
- **Automatic deployments** from GitHub

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/johnsonli010801/billsplitter.git
cd billsplitter
```

#### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`

#### 3. Setup Frontend
```bash
# Open new terminal
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

#### 4. Start Splitting Bills! 🎉
- Create events
- Add friends
- Track expenses
- See who owes what!

## 📖 Usage Guide

### Creating an Event
1. **Visit the app** and click "Create New Event"
2. **Enter event name** (e.g., "John's Birthday Party")
3. **Share the event link** with friends

### Adding People
1. **Enter names** in the "Party People" section
2. **Add as many friends** as needed
3. **Remove people** if they leave the event

### Adding Expenses
1. **Describe the purchase** (e.g., "Pizza", "Drinks")
2. **Enter the amount** in dollars
3. **Select who paid** from the dropdown
4. **Choose who to split with** (or leave empty for everyone)
5. **Click "Add Expense"**

### Viewing Results
- **Individual Balances** show who owes/is owed money
- **Settlements** provide step-by-step payment instructions
- **Green = Owed money**, **Red = Owes money**

## 🌐 API Endpoints

### Events
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get event details

### Users  
- `POST /api/events/{id}/users` - Add user to event
- `DELETE /api/events/{id}/users/{name}` - Remove user

### Expenses
- `POST /api/events/{id}/expenses` - Add expense
- `DELETE /api/events/{id}/expenses/{id}` - Remove expense

### Health
- `GET /api/health` - API health check

## 🎨 Screenshots

### Homepage
Beautiful gradient background with party-themed design

### Event Dashboard  
Colorful cards for managing people and expenses

### Settlement Results
Clear visualization of who owes what

## 🚀 Deployment

This app is deployed using:
- **Backend:** Railway (Python Flask)
- **Frontend:** Railway (React)
- **Database:** PostgreSQL (Production)
- **Auto-deploy:** Connected to GitHub

### Deploy Your Own
1. **Fork this repository**
2. **Deploy backend** to Railway
3. **Deploy frontend** to Railway/Vercel/Netlify
4. **Update API URLs** in frontend
5. **Share with friends!**

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

## 📝 Ideas for Future Features

- [ ] User accounts and login
- [ ] Event history and analytics
- [ ] Multiple currencies support
- [ ] Receipt image uploads
- [ ] Email notifications
- [ ] Export to PDF/CSV
- [ ] Dark mode theme
- [ ] Group templates (dinner, vacation, etc.)

## 🐛 Known Issues

- Free tier hosting may sleep when inactive (first request takes longer)
- Large groups (50+ people) may experience slower performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Why I Built This

Splitting bills with friends should be fun, not frustrating! Traditional calculators are boring, and most apps are either too complex or too plain. I wanted to create something that makes bill splitting feel like a celebration - colorful, engaging, and easy to use.

## 💝 Support

If you found this project helpful:
- ⭐ **Star this repository**
- 🐛 **Report bugs** in Issues
- 💡 **Suggest features** 
- 🔀 **Share with friends**

---

## 👨‍💻 Author

**Johnson（Junpeng) Li**
- 📧 Email: [junpengli010801@gmail.com]
- 💼 LinkedIn: [www.linkedin.com/in/johnson-li-a2309823b]
- 🐦 GitHub: [@johnsonli010801](https://github.com/johnsonli010801)

---

<div align="center">

### 🎉 Made with ❤️ and lots of ☕

*Split bills like a party! Because friends who calculate together, stay together.* 

**[⭐ Star this repo](https://github.com/johnsonli010801/billsplitter)** | **[🚀 Try the app](https://billsplitter-production-d8f2.up.railway.app/)** | **[📖 Read the docs](#-usage-guide)**

</div>

---

*Last updated: July 2025*