# 🚛 Truck Driver Permit System

A mobile-style web application for truck drivers to securely request travel permits, verify identity via face recognition, and view real-time route maps across Saudi Arabia. Designed with a dark theme and full mobile responsiveness for on-the-go use.

---

## 🌟 Features

### 🔐 Secure Authentication
- **Driver Registration**: Collects name, ID, truck number, cargo type, and a captured photo.
- **Face Verification**: Uses `face-api.js` to match the live camera feed with stored facial data.
- **Local Storage**: Data is securely saved in the browser without any external server calls.

### 📱 Mobile-Optimized Interface
- **Dark Themed UI** with touch-friendly buttons.
- **Responsive Design**: Fully functional on mobile browsers.
- **Camera Integration** for registration and login.

### 🗺️ Route & Permit Management
- **Interactive Map** using `Leaflet.js` to display trip routes.
- **GPS Tracking**: Accesses current location for route generation.
- **Permit Scheduling**: Allows drivers to request permits with selected time slots and trip purposes.
- **Trip History**: View past requests and statuses.

---

## 🧰 Tech Stack

| Layer       | Tools / Libraries            |
|-------------|------------------------------|
| Frontend    | HTML5, CSS3, JavaScript ES6+ |
| Mapping     | Leaflet.js, OpenStreetMap    |
| Face Auth   | face-api.js                  |
| Storage     | LocalStorage (in-browser)    |
| Styling     | CSS + media queries          |

---

## 🗂️ File Structure

```
ASIR/
├── model/                         # Face recognition models
├── models/                        # Additional model files
├── configs.js                     # Configuration and constants (ensure keys are removed before sharing)
├── face-api.js / .min.js          # Face recognition library
├── index.html                    # Landing & login page
├── index_1.html                  # Alternate dashboard layout
├── manage.html / manage.js       # Manage permits & user data
├── map.html                      # Live map view
├── upload.js                     # Handles photo uploads
├── script.js                     # Main logic
├── style_1.css / styles.css      # UI styling
└── README.md                     # Project documentation
```

---

## 🚀 How to Run

### ✅ Prerequisites
- Modern browser (Chrome/Edge/Firefox)
- HTTPS access (required for camera)
- Allow camera permissions

### 🧪 Quick Start

1. Clone or download this repo.
2. Open `index.html` in your browser.
3. Register or log in using National ID and facial scan.
4. Access your dashboard, request permits, and view routes.

---

## 📝 How It Works

### Face Verification
- Detects 68 facial landmarks
- Measures similarity via Euclidean distance
- Accepts match if similarity > 60%
- All verification is performed **locally**

### Permit Data Structure

```js
truckDrivers = {
  "1234567890": {
    name: "Ahmed",
    nationalId: "1234567890",
    truckNumber: "TRK-001",
    cargoType: "Food",
    photo: "base64string"
  }
}

permits = [
  {
    id: "P001",
    date: "2025-08-03",
    timeSlot: "10:00 AM",
    route: "Abha → Riyadh",
    purpose: "Delivery",
    driverId: "1234567890",
    status: "approved"
  }
]
```

---

## 🛠️ Customization

### Add New Route
- Update `map.html` and `script.js`:
  - Add new coordinates to the route list.
  - Update the select dropdown and render logic.

### Modify Verification
- Change similarity threshold in `configs.js`.
- Extend `verifyFace()` in `script.js` for more advanced checks.

---

## 🧩 Known Issues

| Issue                | Fix Suggestion                                  |
|---------------------|--------------------------------------------------|
| Camera not working  | Check HTTPS, browser permissions, or try refresh |
| Face not detected   | Improve lighting and keep face centered          |
| Map not loading     | Check Leaflet CDN and internet connection        |

---

## 🌍 Future Plans

- [ ] Connect to backend for real-time database
- [ ] Admin panel for reviewing permits
- [ ] Offline functionality with service workers
- [ ] Multi-language support (Arabic / English)
- [ ] Push notifications via PWA
- [ ] Heatmap of driver activity

---

## 📄 License

MIT License — Free for educational and non-commercial use.

---

## 🙋 Support

For feedback or technical issues, please [open an issue](https://github.com/reemmohammed14200-code/project-1/issues) in the repository.
