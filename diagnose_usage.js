const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Explicitly use the variables from process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables missing:', { supabaseUrl, supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserUsage() {
  const email = "test@gmail.com";
  
  // 1. Get User ID (Assuming you have access to auth.users if using service role)
  // Note: Service role can access auth.users directly via Supabase API
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error listing users:', userError);
    return;
  }
  
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.error('❌ User not found');
    return;
  }
  
  console.log(`✅ Found user: ${user.id}`);
  
  // 2. Check usage_tracking
  const { data, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('❌ Error checking usage_tracking:', error);
  } else {
    console.log('📊 Usage tracking entries:', data);
    if (data.length === 0) {
      console.log('⚠️ No usage tracking entries found for this user. This is likely why usage reservation fails.');
    }
  }
}

checkUserUsage();