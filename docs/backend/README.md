# 🔙 Backend Documentation

This folder contains documentation related to the backend integration of the SmartEdu platform.

## Contents

- [Backend Requirements](./backend-requirements.md) - Requirements for the backend API
- [Backend Architecture](./backend.md) - Overview of the backend architecture

## Overview

The SmartEdu platform integrates with a backend API built with Node.js, Express, and MongoDB. This folder contains documentation for the backend architecture and requirements.

## Key Concepts

- **API Endpoints**: The backend provides RESTful API endpoints for the frontend to consume.
- **Authentication**: The backend handles user authentication and authorization.
- **Data Storage**: The backend stores data in MongoDB.
- **Business Logic**: The backend implements business logic for the application.

## Backend Architecture

The backend is built with:
- **Node.js**: For the server runtime
- **Express**: For the API framework
- **MongoDB**: For the database
- **JWT**: For authentication

## API Endpoints

The backend provides endpoints for:
- **Authentication**: Login, logout, register, password reset
- **Users**: CRUD operations for users
- **Courses**: CRUD operations for courses
- **Classes**: CRUD operations for classes
- **Attendance**: CRUD operations for attendance
- **Grades**: CRUD operations for grades
- **Assignments**: CRUD operations for assignments
- **Notifications**: CRUD operations for notifications

## Related Documentation

- [API Integration Documentation](../api-integration/README.md)
- [Architecture Documentation](../architecture/README.md)
