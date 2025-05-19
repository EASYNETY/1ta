# 🔌 API Integration Documentation

This folder contains documentation related to API integration in the SmartEdu platform.

## Contents

- [API Guide](./ApiGuide.md) - Comprehensive guide for using the API client in the frontend
- [API Integration Plan](./api-integration-plan.md) - Plan for replacing mock data with real API calls
- [Data Types Reference](./data-types-reference.md) - Reference for data types used in the application
- [Mock Data Replacement](./mock-data-replacement.md) - Guide for replacing mock data with real API calls
- [Standardized API Response Format](./standardized-api-response-format.md) - Documentation for standardized API response format
- [Standardized Thunk Template](./standardized-thunk-template.md) - Template for creating standardized Redux thunks
- [Backend API Integration Guide](./backend-api-integration-guide.md) - Guide for integrating with the backend API
- [Classes API Integration Issues](./classes-api-integration-issues.md) - Documentation for issues with classes API integration

## Overview

The SmartEdu platform integrates with a backend API to fetch and manipulate data. This folder contains documentation for how to properly integrate with the API, including best practices, data types, and common issues.

## Key Concepts

- **API Client**: The SmartEdu platform uses a custom API client that handles authentication, error handling, and request/response formatting.
- **Thunks**: Redux thunks are used to make asynchronous API calls and update the Redux store.
- **Data Types**: The API returns data in specific formats that need to be properly typed and validated.
- **Mock Data**: During development, mock data is used to simulate API responses.

## Related Documentation

- [Development Guide](../development/README.md)
- [Backend Documentation](../backend/README.md)
- [Architecture Documentation](../architecture/README.md)
