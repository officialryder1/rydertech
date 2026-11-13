/**
 * RyderTech Inbound Lead Processor — Google Apps Script
 *
 * Purpose: Poll rydertech.ng@gmail.com for EmailJS lead notifications,
 * parse them, and insert into Supabase `lead_inbound_queue`.
 *
 * Setup:
 * 1. In Google Apps Script (script.google.com), create new project
 * 2. Paste this code
 * 3. Set script properties (File > Project properties > Script properties):
 *    - SUPABASE_URL: https://ddwwwqxhqdzbaeswenny.supabase.co
 *    - SUPABASE_SERVICE_ROLE_KEY: <your service role key from Supabase dashboard>
 *    - GMAIL_LABEL: lead-inbound (create this label in Gmail first)
 * 4. Create Gmail filter: from:emailjs@emailjs.com subject:("New lead" OR "lead captured") -> Apply label "lead-inbound"
 * 5. Add time-driven trigger: run processInboundLeads() every 5 minutes
 *
 * EmailJS notification format (from website-rater, ops-drain, etc.):
 * Subject: "New Website Rater result (source: /labs/website-rater). Lead score: 87/100 (hot)."
 * Body contains: URL, Score, Summary, Strengths, Improvements, Categories, from_name, from_email
 */

const CONFIG = {
  SUPABASE_URL: PropertiesService.getScriptProperties().getProperty('SUPABASE_URL'),
  SUPABASE_KEY: PropertiesService.getScriptProperties().getProperty('SUPABASE_SERVICE_ROLE_KEY'),
  GMAIL_LABEL: PropertiesService.getScriptProperties().getProperty('GMAIL_LABEL') || 'lead-inbound',
  BATCH_SIZE: 20,
  DEBUG: false
};

function processInboundLeads() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in script properties');
    return;
  }

  const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
  if (!label) {
    console.log(`Label "${CONFIG.GMAIL_LABEL}" not found`);
    return;
  }

  // Get unread threads with this label
  const threads = label.getThreads(0, CONFIG.BATCH_SIZE);
  if (threads.length === 0) {
    if (CONFIG.DEBUG) console.log('No new threads');
    return;
  }

  let processed = 0;
  let errors = 0;

  for (const thread of threads) {
    // Only process unread messages in this thread
    const messages = thread.getMessages();
    for (const message of messages) {
      if (!message.isUnread()) continue;

      try {
        const lead = parseEmailJSNotification(message);
        if (lead) {
          const inserted = insertToSupabase(lead);
          if (inserted) {
            processed++;
            // Mark message as read and remove label to prevent reprocessing
            message.markRead();
            thread.removeLabel(label);
          } else {
            errors++;
          }
        }
      } catch (e) {
        console.error('Error processing message:', e);
        errors++;
      }
    }
  }

  if (CONFIG.DEBUG) console.log(`Processed ${processed}, errors ${errors}`);
}

function parseEmailJSNotification(message) {
  const subject = message.getSubject();
  const body = message.getPlainBody();

  // Extract tool from subject: "New Website Rater result (source: /labs/website-rater)..."
  const toolMatch = subject.match(/source:\s*\/labs\/([\w-]+)/);
  const tool = toolMatch ? toolMatch[1] : 'unknown';

  // Extract score/tier: "Lead score: 87/100 (hot)"
  const scoreMatch = subject.match(/Lead score:\s*(\d+)\/100\s*\((\w+)\)/);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  const tier = scoreMatch ? scoreMatch[2] : null;

  // Parse body for structured data
  // EmailJS body format varies by template, but typically:
  // from_name: <company>
  // from_email: <email>
  // message: <full summary with URL, Score, Summary, Strengths, etc.>

  const fromNameMatch = body.match(/from_name[:\s]+([^\n]+)/i);
  const fromEmailMatch = body.match(/from_email[:\s]+([^\n]+)/i);
  const company = fromNameMatch ? fromNameMatch[1].trim() : null;
  const email = fromEmailMatch ? fromEmailMatch[1].trim() : null;

  // Extract URL from message body
  const urlMatch = body.match(/URL:\s*([^\n]+)/i);
  const url = urlMatch ? urlMatch[1].trim() : null;

  if (!email) {
    if (CONFIG.DEBUG) console.log('No email found in message:', subject);
    return null;
  }

  // Build lead object
  return {
    source_tool: tool,
    source_email: email,
    source_company: company,
    source_url: url,
    source_score: score,
    source_tier: tier,
    source_data: {
      subject,
      body: body.substring(0, 5000), // truncate for storage
      gmail_message_id: message.getId(),
      gmail_thread_id: message.getThread().getId()
    },
    gmail_message_id: message.getId(),
    gmail_thread_id: message.getThread().getId()
  };
}

function insertToSupabase(lead) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/lead_inbound_queue`;
  const payload = {
    source_tool: lead.source_tool,
    source_email: lead.source_email,
    source_company: lead.source_company,
    source_url: lead.source_url,
    source_score: lead.source_score,
    source_tier: lead.source_tier,
    source_data: lead.source_data,
    gmail_message_id: lead.gmail_message_id,
    gmail_thread_id: lead.gmail_thread_id
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': CONFIG.SUPABASE_KEY,
      'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
      'Prefer': 'return=minimal' // we only need success/fail
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    if (code === 201 || code === 200) {
      if (CONFIG.DEBUG) console.log(`Inserted lead: ${lead.source_email} (${lead.source_tool})`);
      return true;
    } else if (code === 409) {
      // Duplicate gmail_message_id (unique constraint) - already processed
      if (CONFIG.DEBUG) console.log(`Duplicate lead skipped: ${lead.source_email}`);
      return true; // Treat as success, we don't need to reprocess
    } else {
      console.error(`Supabase insert failed (${code}):`, response.getContentText());
      return false;
    }
  } catch (e) {
    console.error('Supabase insert exception:', e);
    return false;
  }
}

// ============================================================
// MANUAL TEST FUNCTIONS
// ============================================================

function testParseLatest() {
  const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
  if (!label) return 'Label not found';
  const threads = label.getThreads(0, 1);
  if (threads.length === 0) return 'No threads';
  const messages = threads[0].getMessages();
  if (messages.length === 0) return 'No messages';
  const lead = parseEmailJSNotification(messages[0]);
  return lead ? JSON.stringify(lead, null, 2) : 'Parse failed';
}

function testSupabaseConnection() {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/lead_inbound_queue?select=count&limit=1`;
  const options = {
    headers: {
      'apikey': CONFIG.SUPABASE_KEY,
      'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
    },
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  return `Status: ${response.getResponseCode()}, Body: ${response.getContentText()}`;
}

function testInsertDummy() {
  const dummy = {
    source_tool: 'test',
    source_email: 'test@example.com',
    source_company: 'Test Co',
    source_url: 'https://example.com',
    source_score: 50,
    source_tier: 'warm',
    source_data: { test: true },
    gmail_message_id: 'test-' + Date.now(),
    gmail_thread_id: 'thread-test-' + Date.now()
  };
  return insertToSupabase(dummy) ? 'OK' : 'FAILED';
}