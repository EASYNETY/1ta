# SmartEdu External Barcode Scanner Integration

This project adds support for external barcode scanners to the SmartEdu attendance tracking system. It allows teachers and administrators to use physical barcode scanners to mark student attendance, in addition to the existing camera-based scanning functionality.

## Features

- **Dual Scanner Modes**: Switch between camera scanning and external scanner modes
- **Real-time WebSocket Integration**: Receive barcode scans in real-time from external hardware
- **Seamless Experience**: Process external scans using the same workflow as camera scans
- **Connection Status Indicators**: Clear visual feedback on external scanner connection status
- **Automatic Reconnection**: Handles connection drops with exponential backoff retry

## Frontend Implementation

The frontend has been updated with the following components:

1. **Custom WebSocket Hook** (`hooks/use-external-scanner-socket.ts`):
   - Manages WebSocket connection to the backend service
   - Handles connection status (connected, connecting, error, disconnected)
   - Implements automatic reconnection with exponential backoff
   - Processes incoming barcode data

2. **Scanner Mode Selection UI** (`app/(authenticated)/attendance/scan/page.tsx`):
   - Tab interface to switch between camera and external scanner modes
   - Visual indicators for WebSocket connection status
   - Reconnect button for manual reconnection

3. **Barcode Processing Logic**:
   - Processes external barcode scans using the same logic as camera scans
   - Updates UI with scan results and attendance status

## Configuration

The frontend expects the following environment variable:

- `NEXT_PUBLIC_WEBSOCKET_URL`: The URL of the WebSocket server (e.g., `ws://api.example.com/ws` or `wss://api.example.com/ws`)

If not provided, it defaults to `ws://localhost:3001`.

## How It Works

1. **User Flow**:
   - User navigates to the attendance scanning page
   - User selects a class to scan for
   - User switches to "External Scanner" mode using the tabs
   - The frontend connects to the WebSocket service
   - When a barcode is received via WebSocket, it's processed as if it were scanned by the camera

2. **WebSocket Connection**:
   - Connection is established when the user switches to external scanner mode and a class is selected
   - Connection includes `userId` and `classId` as query parameters
   - Connection status is displayed to the user
   - Automatic reconnection attempts are made if the connection is lost

3. **Barcode Processing**:
   - When a barcode is received via WebSocket, the `handleBarcodeDetected` function is called
   - The function looks up the student in the Redux store
   - If found, the student's attendance is marked via the Redux action
   - The UI is updated to show the scan result

## Backend Requirements

The backend team needs to implement a WebSocket service that:

1. Accepts WebSocket connections from the frontend
2. Receives barcode data from external scanners via HTTP
3. Routes barcode data to the appropriate frontend client

For detailed requirements, see:

- [External Barcode Scanner Service - Backend Requirements](./external-barcode-scanner-service.md)

## Testing

Once the backend WebSocket service is implemented, you can test the integration by:

1. Configuring the frontend with the WebSocket server URL
2. Navigating to the attendance scanning page
3. Selecting a class and switching to external scanner mode
4. Scanning a barcode with an external scanner

## Future Enhancements

- Support for multiple scanners per class
- Admin interface for managing scanner stations
- Offline mode with scan queueing
- Mobile app relay for Bluetooth scanners
