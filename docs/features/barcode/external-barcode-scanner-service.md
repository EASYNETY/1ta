# External Barcode Scanner WebSocket Service - Backend Requirements

## Overview

This document outlines the requirements for a WebSocket service that the backend team needs to implement to enable external barcode scanners to communicate with the SmartEdu frontend application. The frontend has already been updated to support this feature, and this document explains what the backend needs to do to align with our implementation.

## Architecture

\`\`\`
+-----------------------+     HTTP/Serial/etc.    +-----------------+     WebSocket     +--------------------------+
| External Barcode      | ----------------------> | Backend Service | ----------------> | Frontend (ScanPage.tsx)  |
| Scanner (Hardware)    |                         | (e.g., Node.js) |                   | (Listening for messages) |
+-----------------------+                         +-----------------+                   +--------------------------+
                                                        |  ^
                                                        |  | (Authentication, session management)
                                                        +--+
                                                        |
                                                +-----------------+
                                                | Database/Auth   |
                                                +-----------------+
\`\`\`

## Frontend Implementation Details

The frontend has been updated with the following components:

1. **WebSocket Hook**: A custom hook (`useExternalScannerSocket`) that:
   - Connects to the WebSocket server
   - Handles connection status and reconnection
   - Processes incoming barcode data

2. **Scanner Mode Selection**: The attendance scanning page now has a tab interface to switch between:
   - Camera Scanner: Uses the device camera to scan barcodes
   - External Scanner: Connects to the WebSocket service to receive scans from external hardware

3. **Connection Status UI**: Visual indicators showing the WebSocket connection status:
   - Connected: Ready to receive scans
   - Connecting: Attempting to establish connection
   - Error: Connection failed
   - Disconnected: Not connected to the service

## Backend Requirements

To align with our frontend implementation, the backend team needs to implement a WebSocket service with the following features:

### 1. WebSocket Server

- **WebSocket Endpoint**: Provide a WebSocket endpoint for the frontend to connect to
- **Connection Parameters**: Accept `userId` and `classId` as query parameters when clients connect
- **Authentication**: Validate user authentication (JWT tokens or session cookies)
- **Client Registry**: Maintain a registry of connected clients with their user IDs and class IDs
- **Message Format**: Send barcode data to clients in the expected format (see below)

### 2. HTTP Endpoint for External Scanners

- **Scan Endpoint**: Provide an HTTP endpoint (e.g., `/api/external-scan`) for receiving barcode data from external scanners
- **Required Parameters**:
  - `barcodeId`: The scanned barcode data
  - `targetClassId`: The class ID the scan is intended for
  - `targetUserId` (optional): Specific user ID to target
  - `stationId` (optional): Identifier for the scanning station
- **Message Routing**: Forward the barcode data to the appropriate connected client(s) via WebSocket

### 3. Message Format

#### From External Scanner to Backend (HTTP)

\`\`\`json
{
  "barcodeId": "12345XYZ",
  "targetClassId": "class_123",
  "targetUserId": "user_456",
  "stationId": "station_001"
}
\`\`\`

#### From Backend to Frontend (WebSocket)

\`\`\`json
{
  "barcodeId": "12345XYZ",
  "timestamp": "2023-07-15T14:30:45Z",
  "source": "station_001"
}
\`\`\`

The frontend expects to receive messages with the event name `external_barcode_scanned`.

### 4. Security Considerations

- **WebSocket Authentication**: Implement secure authentication for WebSocket connections
- **HTTPS/WSS**: Use secure connections (HTTPS for HTTP endpoints, WSS for WebSocket)
- **CORS**: Configure CORS to allow connections from the frontend application
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Input Validation**: Validate all input data to prevent injection attacks

## Implementation Recommendations

### Technology Stack

We recommend using:
- **Node.js** with **Express** for the HTTP server
- **Socket.IO** or **ws** for WebSocket functionality
- **JWT** for authentication

### Client Identification Strategy

There are several ways to identify which client should receive a barcode scan:

1. **User + Class Targeting**: Route scans to a specific user scanning for a specific class
2. **Class-Only Targeting**: Route scans to any user scanning for a specific class
3. **Station-Based Routing**: Associate scanning stations with specific classes or users

We recommend implementing at least the first two options.

### Connection Management

- **Reconnection**: Handle client reconnection attempts gracefully
- **Heartbeats**: Implement heartbeat mechanism to detect stale connections
- **Error Handling**: Provide meaningful error messages to clients

## Testing

The backend team should test the WebSocket service with:

1. **Connection Testing**: Verify that the frontend can connect successfully
2. **Authentication Testing**: Verify that authentication works correctly
3. **Message Routing**: Verify that barcode data is routed to the correct client
4. **Load Testing**: Verify that the service can handle multiple concurrent connections
5. **Error Handling**: Verify that the service handles errors gracefully

## Frontend Integration Details

The frontend connects to the WebSocket server when the user:
1. Navigates to the attendance scanning page
2. Selects a class to scan for
3. Switches to "External Scanner" mode

The WebSocket connection is established with the following parameters:
- `userId`: The ID of the logged-in user
- `classId`: The ID of the selected class

When a barcode is received via WebSocket, it is processed using the same logic as if it were scanned by the camera.

## Configuration

The frontend expects the following environment variables:
- `NEXT_PUBLIC_WEBSOCKET_URL`: The URL of the WebSocket server (e.g., `ws://api.example.com/ws` or `wss://api.example.com/ws`)

## Future Considerations

1. **Multiple Scanner Support**: Support for multiple scanners per class
2. **Admin Interface**: Web interface for managing scanner stations
3. **Analytics**: Track scan patterns and performance metrics
4. **Mobile App Relay**: Support for using mobile devices as barcode scanner relays
