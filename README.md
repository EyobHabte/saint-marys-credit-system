# Saint Mary’s University Employee Credit & Saving System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-009688?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)

Full-stack Web Application — **React · Django · PostgreSQL**

>A web-based platform for Saint Mary’s University employees to manage personal savings and credit transactions.


## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Usage](#usage)
8. [Running Tests](#running-tests)
9. [License](#license)

---

## Project Overview
Saint Mary’s University Employee Credit & Saving System is a full-stack application designed to automate the association’s manual processes. Employees can register, deposit, request loans, and view transaction history via a user-friendly interface, while administrators manage approvals, reporting, and system configuration.

## Features
- **Member Registration & Authentication**
- **Savings Management**: deposits, withdrawals, balance overview
- **Loan Management**: request, approve/reject, repayment schedules
- **Reporting Dashboard**: monthly summaries, custom reports
- **Role-based Access Control**: Admin, Finance Officer, Member

## Tech Stack
- **Frontend**: React, React Router, Axios
- **Backend**: Django, Django REST Framework
- **Database**: PostgreSQL
- **Deployment**: GitHub Actions (CI), Docker (optional)

## Repository Structure
```
/                   # Root directory
├── backend/        # Django project
│   ├── manage.py
│   ├── requirements.txt
│   └── <apps>/     # account, loan, deposit, member, report, etc.
│       ├── migrations/
│       └── views.py
├── frontend/       # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md   # Frontend-specific instructions
├── docs/           # Design docs, diagrams, exports
├── .gitignore
└── README.md       # This file
```

## Prerequisites
- Python 3.10+  
- Node.js 16+ & npm  
- PostgreSQL  
- Git  

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/EyobHabte/saint-marys-credit-system.git
cd saint-marys-credit-system
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Configure database in settings.py
python manage.py migrate
python manage.py runserver
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```

## Usage
- Access the frontend at `http://localhost:3000`  
- API endpoints served at `http://localhost:8000/api/`  

## Running Tests
### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```


---

*Made with ★ by Eyob Habte*

