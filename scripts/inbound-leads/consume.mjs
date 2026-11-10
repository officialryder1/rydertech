#!/usr/bin/env node
/**
 * RyderTech Inbound Lead Consumer
 *
 * Reads from Supabase `lead_inbound_queue`, calls `nurture.mjs --add` for each,
 * marks rows completed/failed.
 *
 * Usage:
 *   node scripts/inbound-leads/consume.mjs           # process up to 10 pending
 *   node scripts/inbound-leads/consume.mjs --batch 50 # custom batch size
 *   node scripts/inbound-leads/consume.mjs --loop     # run continuously every 60s
 *   node scripts/inbound-leads/consume.mjs --stats    # show queue stats
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// Load env from .env.local
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  try {
    const content = require('node:fs').readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      // Handle KEY=VALUE or KEY = VALUE (with spaces), strip CR
      const cleanLine = line.replace(/\r$/, '');
      const m = cleanLine.match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // .env.local may not exist; rely on shell env
  }
}
loadEnv();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Create .env.local with:');
  console.error('  PUBLIC_SUPABASE_URL=https://ddwwwqxhqdzbaeswenny.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const NURTURE_CLI = join(ROOT, 'scripts', 'leads', 'nurture.mjs');

async function claimBatch(batchSize = 10) {
  const { data, error } = await supabase
    .from('lead_inbound_queue')
    .update({ status: 'processing' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize)
    .select();
  if (error) throw error;
  return data || [];
}

async function markCompleted(id) {
  const { error } = await supabase
    .from('lead_inbound_queue')
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

async function markFailed(id, errMsg) {
  const { error } = await supabase
    .from('lead_inbound_queue')
    .update({ status: 'failed', processed_at: new Date().toISOString(), error_message: errMsg })
    .eq('id', id);
  if (error) throw error;
}

async function getStats() {
  const { data, error } = await supabase
    .from('lead_inbound_queue')
    .select('status, source_tool', { count: 'exact' });
  if (error) throw error;

  const counts = { pending: 0, processing: 0, completed: 0, failed: 0, byTool: {} };
  for (const row of data || []) {
    counts[row.status] = (counts[row.status] || 0) + 1;
    counts.byTool[row.source_tool] = (counts.byTool[row.source_tool] || 0) + 1;
  }
  return counts;
}

function callNurtureAdd(email, tool, extra = {}) {
  const args = ['--add', email, tool];
  if (Object.keys(extra).length > 0) {
    args.push(JSON.stringify(extra));
  }

  const result = spawnSync('node', [NURTURE_CLI, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30000
  });

  if (result.error) {
    throw new Error(`Spawn failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`nurture.mjs exited ${result.status}: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

async function processBatch(batchSize = 10) {
  console.log(`[${new Date().toISOString()}] Claiming batch of ${batchSize}...`);
  const leads = await claimBatch(batchSize);

  if (leads.length === 0) {
    console.log('No pending leads');
    return 0;
  }

  let ok = 0, fail = 0;

  for (const lead of leads) {
    console.log(`  Processing ${lead.source_email} (${lead.source_tool})...`);
    try {
      const extra = {};
      if (lead.source_score !== null) extra.lead_score = lead.source_score;
      if (lead.source_tier) extra.lead_tier = lead.source_tier;

      const output = callNurtureAdd(lead.source_email, lead.source_tool, extra);
      console.log(`    ${output}`);
      await markCompleted(lead.id);
      ok++;
    } catch (e) {
      console.error(`    FAILED: ${e.message}`);
      await markFailed(lead.id, e.message);
      fail++;
    }
  }

  console.log(`Done: ${ok} ok, ${fail} failed`);
  return ok + fail;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--stats')) {
    const stats = await getStats();
    console.log('Queue stats:', JSON.stringify(stats, null, 2));
    return;
  }

  const batchSize = args.includes('--batch') ? parseInt(args[args.indexOf('--batch') + 1], 10) : 10;
  const loop = args.includes('--loop');

  if (loop) {
    console.log('Starting continuous loop (60s interval)...');
    while (true) {
      try {
        await processBatch(batchSize);
      } catch (e) {
        console.error('Loop error:', e.message);
      }
      await new Promise(r => setTimeout(r, 60000));
    }
  } else {
    await processBatch(batchSize);
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});