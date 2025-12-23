import { apiService } from './apiService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  response?: string;
  [key: string]: any;
}

/**
 * Send a message to AI chatbot
 */
export const sendMessage = async (message: string): Promise<string> => {
  try {
    console.log('Chat service - Sending message:', message);
    
    const response = await apiService.post('/gemini/chat', {
      message: message,
    });

    console.log('Chat service - Response received:', response);
    console.log('Chat service - Response type:', typeof response);
    console.log('Chat service - Has response property:', 'response' in (response || {}));

    // apiService already returns response.data, so response is the data object directly
    if (response && typeof response === 'object' && 'response' in response) {
      const responseText = response.response;
      if (typeof responseText === 'string') {
        return responseText;
      }
    }

    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Chat service error:', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      
      if (error.response.status === 404) {
        throw new Error('Endpoint không tồn tại. Vui lòng kiểm tra lại.');
      } else if (error.response.status === 401) {
        throw new Error('Bạn cần đăng nhập để sử dụng tính năng này.');
      } else {
        throw new Error(error.response.data?.message || 'Lỗi khi gọi API chat');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else {
      console.error('Error:', error.message);
      throw new Error('Đã xảy ra lỗi: ' + error.message);
    }
  }
};

/**
 * Create a new chat message
 */
export const createMessage = (role: 'user' | 'assistant', content: string): ChatMessage => {
  return {
    id: Date.now().toString() + Math.random(),
    role,
    content,
    timestamp: new Date(),
  };
};

/**
 * Get suggested questions
 */
export const getSuggestedQuestions = (): string[] => {
  return [
    'Có những loại phòng nào?',
    'Giá phòng Deluxe bao nhiêu?',
    'Khách sạn có những tiện ích gì?',
    'Nhà hàng phục vụ món gì?',
    'Chính sách hủy phòng như thế nào?',
  ];
};

export const chatService = {
  sendMessage,
  createMessage,
  getSuggestedQuestions,
};
