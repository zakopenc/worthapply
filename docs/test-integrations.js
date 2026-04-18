#!/usr/bin/env node

/**
 * Integration Test Script for WorthApply
 * Tests Supabase and Stripe connectivity
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testSupabase() {
  console.log('\n' + '='.repeat(50));
  console.log('TESTING SUPABASE CONNECTION');
  console.log('='.repeat(50));

  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      log.error('NEXT_PUBLIC_SUPABASE_URL not found in environment');
      return false;
    }
    log.success('NEXT_PUBLIC_SUPABASE_URL found');

    if (!supabaseAnonKey) {
      log.error('NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment');
      return false;
    }
    log.success('NEXT_PUBLIC_SUPABASE_ANON_KEY found');

    if (!supabaseServiceKey) {
      log.error('SUPABASE_SERVICE_ROLE_KEY not found in environment');
      return false;
    }
    log.success('SUPABASE_SERVICE_ROLE_KEY found');

    // Test connection with anon key
    log.info('Testing client connection...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to query profiles table
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      log.error(`Profile table query failed: ${error.message}`);
      return false;
    }
    log.success(`Profile table accessible (${count || 0} records)`);

    // Test service role connection
    log.info('Testing service role connection...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (adminError) {
      log.error(`Service role query failed: ${adminError.message}`);
      return false;
    }
    log.success('Service role connection working');

    return true;
  } catch (error) {
    log.error(`Supabase test failed: ${error.message}`);
    return false;
  }
}

async function testStripe() {
  console.log('\n' + '='.repeat(50));
  console.log('TESTING STRIPE CONNECTION');
  console.log('='.repeat(50));

  try {
    // Check environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      log.error('STRIPE_SECRET_KEY not found in environment');
      return false;
    }
    log.success('STRIPE_SECRET_KEY found');

    if (!stripePublishableKey) {
      log.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in environment');
      return false;
    }
    log.success('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY found');

    if (!stripeWebhookSecret) {
      log.warn('STRIPE_WEBHOOK_SECRET not found (needed for webhooks)');
    } else {
      log.success('STRIPE_WEBHOOK_SECRET found');
    }

    // Test Stripe API connection
    log.info('Testing Stripe API connection...');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-03-25.dahlia',
    });

    // Try to list products
    const products = await stripe.products.list({ limit: 3 });
    log.success(`Stripe API working (${products.data.length} products found)`);

    // List prices
    const prices = await stripe.prices.list({ limit: 5 });
    log.success(`Found ${prices.data.length} price(s)`);

    if (prices.data.length > 0) {
      log.info('Available prices:');
      prices.data.forEach(price => {
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
        console.log(`  - ${price.id}: $${amount} ${price.currency?.toUpperCase() || 'USD'}/${price.recurring?.interval || 'one-time'}`);
      });
    }

    return true;
  } catch (error) {
    log.error(`Stripe test failed: ${error.message}`);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n' + '='.repeat(50));
  console.log('TESTING WEBHOOK ENDPOINT');
  console.log('='.repeat(50));

  try {
    const webhookUrl = 'https://worthapply.com/api/webhooks/stripe';
    log.info(`Testing endpoint: ${webhookUrl}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });

    log.info(`Response status: ${response.status}`);
    
    if (response.status === 400) {
      log.success('Webhook endpoint exists (signature validation working)');
      return true;
    } else if (response.status === 200) {
      log.success('Webhook endpoint accessible');
      return true;
    } else {
      log.warn(`Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Webhook test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('WORTHAPPLY INTEGRATION TESTS');
  console.log('='.repeat(50));

  const results = {
    supabase: await testSupabase(),
    stripe: await testStripe(),
    webhook: await testWebhookEndpoint()
  };

  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Supabase: ${results.supabase ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Stripe: ${results.stripe ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Webhook: ${results.webhook ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log('='.repeat(50) + '\n');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log.success('All tests passed! ✨');
    process.exit(0);
  } else {
    log.error('Some tests failed. Please check configuration.');
    process.exit(1);
  }
}

runTests();
