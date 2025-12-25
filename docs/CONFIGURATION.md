# Configuration Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### API Configuration
```env
# Cloudflare Worker URL for R2 storage and API endpoints
NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev
```

### Optional Services
```env
# Giphy API (for GIF search functionality)
NEXT_PUBLIC_GIPHY_API_KEY=your_giphy_api_key
```

## Recent Improvements

### Error Handling & Resilience
- ✅ Comprehensive error boundaries around all providers
- ✅ Retry logic with exponential backoff for API calls
- ✅ Request cancellation using AbortController
- ✅ Timeout handling for all network requests
- ✅ Firebase connection monitoring

### API Layer
- ✅ In-memory caching with TTL
- ✅ Automatic cache invalidation on mutations
- ✅ Request deduplication
- ✅ Better error classification and user-friendly messages

### State Management
- ✅ Error boundaries isolate provider failures
- ✅ Connection status monitoring
- ✅ Graceful degradation when services fail

## Key Files

- `/src/lib/error-handler.ts` - Centralized error handling
- `/src/lib/api-cache.ts` - API response caching
- `/src/lib/api-types.ts` - Type definitions and guards
- `/src/hooks/use-error-handler.ts` - Error handling hook
- `/src/hooks/use-firebase-connection.ts` - Connection monitoring
- `/src/components/ui/ErrorBoundary.tsx` - Enhanced error boundary
- `/src/components/layout/ConnectionStatus.tsx` - Connection indicator
