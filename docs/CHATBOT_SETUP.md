# WorthApply AI Chatbot Setup

## Overview
Professional AI chatbot powered by Google Gemini 2.0 Flash, specifically trained on WorthApply's complete site content.

## Features
- ✅ Polite and professional personality
- ✅ Complete knowledge of WorthApply features, pricing, and services
- ✅ Only answers questions about WorthApply (redirects off-topic questions)
- ✅ Beautiful floating chat widget on all marketing pages
- ✅ Conversation history maintained within each session
- ✅ Mobile-responsive design
- ✅ Dark mode support

## Files Created

### 1. Knowledge Base
**File**: `src/lib/gemini/knowledge-base.ts`
- Complete WorthApply site information
- Features, pricing, comparisons, success stories
- URLs and contact information
- Updated: April 2026

### 2. Chat API Endpoint
**File**: `src/app/api/chat/route.ts`
- POST endpoint at `/api/chat`
- Uses Gemini 2.0 Flash (gemini-2.0-flash-exp)
- System prompt enforces polite, professional, site-focused responses
- Conversation history support
- Error handling with fallback messages

### 3. Chat Widget Component
**File**: `src/components/chat-widget.tsx`
- Floating chat button (bottom-right)
- Beautiful gradient design
- Typing indicators
- Smooth animations
- Message history
- Auto-scroll

### 4. Integration
**File**: `src/app/(marketing)/layout.tsx`
- ChatWidget added to all marketing pages
- Appears on: homepage, features, pricing, about, blog, etc.

## Environment Variables

### Already Configured
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDYraG5UPMylg-OyxQVSI3QSFwD3hg4s8c
```

✅ Added to local `.env.local`
✅ Added to Vercel (manual)

## Testing Locally

1. Start the development server:
```bash
cd /home/zak/projects/worthapply
npm run dev
```

2. Open your browser to `http://localhost:3000`
3. Click the floating chat button in the bottom-right
4. Test with questions like:
   - "What is WorthApply?"
   - "How much does it cost?"
   - "What features do you have?"
   - "How is WorthApply different from Jobscan?"

## Deployment

### To Vercel

1. Push changes to GitHub:
```bash
git add .
git commit -m "Add AI chatbot with Gemini 2.0 Flash"
git push origin main
```

2. Vercel will automatically deploy
3. Verify the `GOOGLE_GENERATIVE_AI_API_KEY` is set in Vercel dashboard

### Manual Verification
- Visit https://worthapply.com
- Chat button should appear in bottom-right
- Test the chatbot with various questions
- Verify it only answers WorthApply-related questions

## Chatbot Personality

The chatbot is configured to be:
- **Extremely polite and professional**
- **Warm and welcoming**
- **Patient and understanding**
- **Clear and concise**
- **Helpful and supportive**

## Response Rules

1. ✅ ONLY answers questions about WorthApply
2. ❌ Redirects off-topic questions politely
3. ✅ Includes relevant links when helpful
4. ✅ Ends with follow-up questions
5. ✅ Suggests contacting support if uncertain
6. ✅ Always encouraging about job search

## Example Conversations

### Example 1: Feature Question
**User**: "What is WorthApply?"
**Bot**: "Hello! I'd be happy to explain. WorthApply is a professional job search platform that helps you land interviews 3x faster. We analyze how well you fit each job before you apply..."

### Example 2: Pricing Question
**User**: "How much does it cost?"
**Bot**: "Great question! We offer three pricing tiers: Free Plan - $0 forever, Pro Plan - $39/month (Most Popular!), Premium Plan - $79/month..."

### Example 3: Off-Topic Redirect
**User**: "How do I write a resume?"
**Bot**: "I'm specifically here to help you with questions about WorthApply. Is there anything about our platform I can help you with? For example, I can explain how our resume tailoring feature works!"

## Updating Knowledge Base

To update the chatbot's knowledge:

1. Edit `src/lib/gemini/knowledge-base.ts`
2. Update the `WORTHAPPLY_KNOWLEDGE` constant
3. Rebuild and deploy:
```bash
npm run build
git add src/lib/gemini/knowledge-base.ts
git commit -m "Update chatbot knowledge base"
git push origin main
```

## Customizing Personality

To adjust the chatbot's personality:

1. Edit `src/app/api/chat/route.ts`
2. Modify the `SYSTEM_PROMPT` constant
3. Adjust temperature in `generationConfig` (0.7 = balanced)
4. Rebuild and deploy

## Troubleshooting

### Chatbot not appearing
- Check browser console for errors
- Verify component is in marketing layout
- Clear browser cache

### API errors
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check Vercel logs for errors
- Test API endpoint directly: POST to `/api/chat`

### Wrong responses
- Update knowledge base
- Adjust system prompt
- Check conversation history

## API Usage & Costs

**Model**: Gemini 2.0 Flash (experimental)
- **Speed**: Very fast (~1-2 seconds)
- **Cost**: ~$0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Rate Limits**: Standard Gemini API limits

**Estimated Costs**:
- 100 conversations/day ≈ $0.10/day
- 1,000 conversations/day ≈ $1.00/day

## Future Enhancements

Potential improvements:
- [ ] Add conversation history persistence (database)
- [ ] Add suggested questions/quick replies
- [ ] Add typing indicators with estimated time
- [ ] Add analytics/tracking
- [ ] Add rate limiting per user
- [ ] Add conversation export feature
- [ ] Add admin dashboard for monitoring

## Support

For issues or questions:
- Email: hello@worthapply.com
- GitHub: zakopenc/worthapply

---

**Status**: ✅ Production Ready
**Last Updated**: April 6, 2026
**Model**: Gemini 2.0 Flash Experimental
**Version**: 1.0.0
