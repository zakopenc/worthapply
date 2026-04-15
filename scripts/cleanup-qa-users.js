#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete');
const jsonOutput = args.includes('--json');
const beforeDateArg = readFlagValue('--before-date');

const emailPatterns = [
  /(^|[._+-])qa([._+-]|@)/i,
  /^qa[._+-]/i,
  /(^|[._+-])test([._+-]|@)/i,
  /^test[._+-]?/i,
  /@example\.com$/i,
  /@worthapply-test\.com$/i,
  /worthapply-test/i,
];

const namePatterns = [
  /qa/i,
  /test/i,
];

function readFlagValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] || null;
}

function parseBeforeDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    console.error(`Invalid --before-date value: ${value}. Expected YYYY-MM-DD.`);
    process.exit(1);
  }

  return parsed;
}

function matchesQaOrTestUser(user) {
  const email = user.email || '';
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';

  return emailPatterns.some((pattern) => pattern.test(email))
    || namePatterns.some((pattern) => pattern.test(fullName));
}

function isOlderThanCutoff(user, cutoff) {
  if (!cutoff) {
    return true;
  }

  const createdAt = new Date(user.created_at || 0);
  return createdAt < cutoff;
}

function pickUserFields(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at || null,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    provider: user.app_metadata?.provider || null,
  };
}

async function listAllUsers() {
  const users = [];

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < 200) {
      break;
    }
  }

  return users;
}

async function fetchProfiles(ids) {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, plan, subscription_status, created_at')
    .in('id', ids);

  if (error) {
    throw error;
  }

  return data;
}

async function main() {
  const cutoff = parseBeforeDate(beforeDateArg);
  const users = await listAllUsers();
  const matches = users
    .filter((user) => matchesQaOrTestUser(user) && isOlderThanCutoff(user, cutoff))
    .map(pickUserFields)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const matchedIds = matches.map((user) => user.id);
  const matchedProfiles = await fetchProfiles(matchedIds);

  if (jsonOutput) {
    console.log(JSON.stringify({
      mode: shouldDelete ? 'delete' : 'dry-run',
      before_date: beforeDateArg,
      count: matches.length,
      matches,
      profiles: matchedProfiles,
    }, null, 2));
  } else {
    console.log(`Mode: ${shouldDelete ? 'DELETE' : 'DRY RUN'}`);
    console.log(`Matched QA/test users: ${matches.length}`);
    if (cutoff) {
      console.log(`Created before: ${cutoff.toISOString()}`);
    }

    for (const user of matches) {
      console.log(`- ${user.email} | ${user.id} | created ${user.created_at}`);
    }
  }

  if (!shouldDelete) {
    return;
  }

  const deleted = [];
  for (const user of matches) {
    const { error } = await supabase.auth.admin.deleteUser(user.id, false);
    if (error) {
      throw { user, error };
    }
    deleted.push(user);
  }

  const remainingUsers = (await listAllUsers())
    .filter((user) => matchedIds.includes(user.id))
    .map(pickUserFields);
  const remainingProfiles = await fetchProfiles(matchedIds);

  const summary = {
    deleted_count: deleted.length,
    deleted,
    remaining_auth_users: remainingUsers,
    remaining_profiles: remainingProfiles,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('Deletion complete.');
    console.log(`Deleted: ${deleted.length}`);
    console.log(`Remaining auth users: ${remainingUsers.length}`);
    console.log(`Remaining profiles: ${remainingProfiles.length}`);
  }
}

main().catch((error) => {
  console.error(JSON.stringify(error, null, 2));
  process.exit(1);
});
