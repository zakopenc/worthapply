import { createServiceClient } from '@/lib/supabase/server';

/**
 * Log an AI generation failure to the ai_errors table.
 * Errors are swallowed — logging failure must never surface to the caller.
 */
export async function logAiError(params: {
  userId?: string;
  route: string;
  error: unknown;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createServiceClient();
    const err = params.error instanceof Error ? params.error : new Error(String(params.error));
    await supabase.from('ai_errors').insert({
      user_id: params.userId ?? null,
      route: params.route,
      error_type: err.name,
      error_message: err.message.slice(0, 500),
      metadata: params.metadata ?? null,
    });
  } catch (loggingError) {
    console.error('AI error logging failed:', loggingError);
  }
}

/**
 * Log an incoming Stripe webhook event result.
 * Errors are swallowed — logging failure must never block webhook processing.
 */
export async function logWebhookEvent(params: {
  stripeEventId: string;
  type: string;
  status: 'processed' | 'failed' | 'ignored';
  errorMessage?: string;
}) {
  try {
    const supabase = await createServiceClient();
    await supabase.from('webhook_events').insert({
      stripe_event_id: params.stripeEventId,
      type: params.type,
      status: params.status,
      error_message: params.errorMessage ?? null,
    });
  } catch (loggingError) {
    console.error('Webhook event logging failed:', loggingError);
  }
}
