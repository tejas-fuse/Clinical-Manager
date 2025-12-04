# Clinical Manager - Duty Roster Application

A comprehensive duty roster management system for healthcare facilities with role-based access control and detailed analytics.

Live App: https://clinical-manager-tt.vercel.app

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
```powershell
git clone https://github.com/tejas-fuse/Clinical-Manager.git
cd Clinical-Manager
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm start
```

4. Open your browser to `http://localhost:3000`

### First Time Setup

1. Default admin is created automatically: `admin / admin123`
2. On first admin login, you will be prompted to set a new password
3. As Admin: create wards (e.g., "ICU", "General", "Emergency")
4. Add user accounts and assign wards to them
5. In-Charge can then assign duties within their assigned wards

## 📊 Usage Guide

### For In-Charge Users
1. **Manage Roster**: Click on any cell to assign staff to duties
2. **View Requests**: Click the "Requests" button (shows pending count)
3. **View Analytics**: Navigate to "Staff Analytics" tab to see performance metrics
4. **Assign Only**: Cannot add or remove users; can only assign duties to staff allocated to their ward

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

- Master password reset flow has been removed.
- Admin must change the default password on first login.
- For production use, consider server-side auth, password hashing, JWT, and a database.

## 📂 File Structure

```
Clinical-Manager/
  public/
    index.html
  src/
    components/
      AdminPanel.jsx
      AdminWardManagement.jsx
      Header.jsx
      InChargeStaffPanel.jsx
      LoginModal.jsx
      Navigation.jsx
      RequestModals.jsx
      StaffBadge.jsx
      StaffModal.jsx
      WardModal.jsx
      AnalyticsView.jsx
      ProfileView.jsx
    constants/
      config.js        # Roles, permissions, shifts, holidays, statuses
    utils/
      helpers.js       # Date and formatting helpers
    App.js             # Main app: state, routing, roster
    index.js           # React bootstrap
    index.css          # Global styles
  package.json         # Scripts and dependencies
  README.md
```

### LocalStorage Keys
- `clinical_users`
- `clinical_current_user`
- `duty_roster_wards`
- `duty_roster_all_staff`
- `duty_roster_all_assignments`
- `duty_roster_change_requests`

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please create an issue on GitHub.

---

Developed for efficient clinical duty management 🏥
