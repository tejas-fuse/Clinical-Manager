# Clinical Manager - Duty Roster Application

A comprehensive duty roster management system for healthcare facilities with role-based access control and detailed analytics.

## 🎯 Features

### Authentication & Authorization
- **User Registration & Login** - Secure authentication system
- **Three User Roles:**
  - **Administrator** - Full system access
  - **In-Charge** - Edit duties and approve requests
  - **Staff Member** - View roster and submit change requests

### Duty Roster Management
- Weekly view with customizable date ranges
- Multiple shifts: Morning, Evening, Night, Leave
- Ward-based organization (create multiple wards)
- Staff role categorization (In-Charge Sister, Staff, Attendant, Sweeper, Leave Reliever)
- Holiday and Sunday highlighting
- Print-friendly layout

### Change Request System
- Staff can request duty changes with reasons
- In-Charge receives notifications for pending requests
- Approve/Reject requests with status tracking
- Request history maintained

### Profile & Analytics

#### My Profile (All Users)
- Personal duty statistics
- Monthly duty count (current and previous month)
- Total lifetime duties
- Weekly breakdown for current month
- Shift distribution charts

#### Staff Analytics (In-Charge/Admin Only)
- Overview of all staff members
- Monthly duty comparisons
- Individual staff performance
- Week-by-week breakdown for each staff member
- Shift distribution analysis
- Filterable by month

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tejas-fuse/Clinical-Manager.git
cd Clinical-Manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

### First Time Setup

1. Click "Register" to create your first account
2. Choose your role (recommend creating an In-Charge account first)
3. Create a ward (e.g., "ICU", "General", "Emergency")
4. Add staff members to the ward
5. Start assigning duties!

## 📊 Usage Guide

### For In-Charge Users
1. **Manage Roster**: Click on any cell to assign staff to duties
2. **View Requests**: Click the "Requests" button (shows pending count)
3. **View Analytics**: Navigate to "Staff Analytics" tab to see performance metrics
4. **Manage Staff**: Add or remove staff members from the ward

### For Staff Users
1. **View Roster**: See your assigned duties for the week
2. **Request Changes**: Click on any duty cell to request a change (provide reason)
3. **View Profile**: Navigate to "My Profile" to see your duty statistics

## 🛠️ Technology Stack

- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **LocalStorage** - Data persistence

## 📝 Data Storage

All data is stored locally in the browser's localStorage:
- User accounts and credentials
- Ward information
- Staff assignments
- Duty assignments
- Change requests

## 🔒 Security Note

This is a client-side application with basic authentication. For production use, implement:
- Server-side authentication
- Password hashing (bcrypt)
- JWT tokens
- Database integration
- API endpoints

## 📄 License

MIT License - feel free to use and modify for your healthcare facility.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please create an issue on GitHub.

---

Developed for efficient clinical duty management 🏥
