// Error handling service for ticket scanning

// Define error types we might get from API
type ErrorResponse = {
  message?: string;
  error?: string;
  code?: string;
  status?: number;
};

// Map API error codes/messages to user-friendly messages
const errorMessages: Record<string, string> = {
  'ticket_already_used': 'Tiket ini sudah pernah digunakan untuk check-in.',
  'ticket_not_found': 'Tiket tidak ditemukan.',
  'ticket_invalid': 'Tiket tidak valid untuk event ini.',
  'event_not_started': 'Event ini belum dimulai.',
  'event_ended': 'Event ini sudah berakhir.',
  'authentication_error': 'Silahkan login ulang untuk melanjutkan.',
  'participant_cancelled': 'Peserta sudah membatalkan tiket ini.',
  'default': 'Terjadi kesalahan saat memproses tiket.'
};

// Function to parse error response
export function parseTicketError(error: any): string {
  // Default error message
  let message = errorMessages['default'];
  
  try {
    let errorData: ErrorResponse = {};
    
    // Parse error if it's a string (likely JSON)
    if (typeof error === 'string') {
      try {
        errorData = JSON.parse(error);
      } catch (e) {
        // If can't parse as JSON, use as is
        return error || message;
      }
    } else if (error && typeof error === 'object') {
      // Already an object
      errorData = error;
    }
    
    // Try to extract error code or message
    const errorCode = errorData.code;
    const errorMessage = errorData.message || errorData.error;
    
    // Check if we have a predefined message for this error code
    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }
    
    // Use the error message if provided
    if (errorMessage) {
      return errorMessage;
    }
    
    // For HTTP status-related errors
    if (errorData.status === 401 || errorData.status === 403) {
      return errorMessages['authentication_error'];
    }
    
  } catch (e) {
    console.error('Error parsing error response:', e);
  }
  
  // Return the default message if we couldn't extract any useful information
  return message;
}

export default {
  parseTicketError
};
