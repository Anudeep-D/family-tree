# 👨‍👩‍👧‍👦 Family Tree App

A full-stack Family Tree web application built using:

- **Backend**: Java Spring Boot, Neo4j (graph DB)
- **Frontend**: React + TypeScript, React Flow
- **Auth**: JWT-based authentication & role-based access (Admin / Editor / Viewer)
- **DevOps**: Podman, NGINX, podman-compose

---

## 📦 Features

- Add persons, partners, and parent-child relationships
- View the tree graph using React Flow
- Invite other users to view or edit the tree
- Role-based permissions
- Containerized setup for development and deployment

---

## 🔐 Roles

- **Admin**: Full access to tree and user management
- **Editor**: Can add/edit members but not assign roles
- **Viewer**: Read-only access

---

## 🚀 Setup Instructions

### Backend (Spring Boot + Neo4j)

1. Clone the repo then copy and configure the .env:
   ```bash
    git clone https://github.com/yourname/family-tree.git
    cp .env.example .env

2. run with podman:
    ```bash
    cd family-tree
    podman-compose up -d --build

3. run seperately:
    ```bash
    cd family-tree/familytree
    ./gradlew bootRun
    cd family-tree/familyTreeUI
    npm install
    npm run dev
