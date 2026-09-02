"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
    },
    PROFILES: {
        ME: '/profiles/me',
        BY_ID: (id) => `/profiles/${id}`,
        LIST: '/profiles',
    },
    LIKES: {
        LIKE: '/likes',
        UNLIKE: (id) => `/likes/${id}`,
    },
    MATCHES: {
        LIST: '/matches',
        BY_ID: (id) => `/matches/${id}`,
    },
    MATCHING_SERVICE: {
        RECOMMENDATIONS: '/api/v1/recommendations',
        SIMILARITY: '/api/v1/similarity',
    },
    CHAT_SERVICE: {
        WEBSOCKET: '/ws/chat',
        HEALTH: '/health',
    }
};
