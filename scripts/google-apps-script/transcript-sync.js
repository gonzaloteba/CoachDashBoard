/**
 * Google Apps Script — Transcript Sync for Zalud Coach Dashboard
 *
 * This script watches a Google Drive folder for new Gemini-generated
 * transcripts (Google Docs) and sends them to the dashboard webhook.
 *
 * Setup:
 *   1. Go to https://script.google.com and create a new project
 *   2. Paste this entire file into Code.gs
 *   3. Update CONFIG below with your values
 *   4. Run setupTrigger() once to create the automatic timer
 */

// ============================================
// CONFIGURATION — Update these values
// ============================================

const CONFIG = {
  // The Drive folder where Gemini saves transcripts
  FOLDER_ID: '1wq0z8V5iWR9qnLsE5TrdMDpVDJdlQ0qM',

  // Dashboard webhook URL
  WEBHOOK_URL: 'https://zalud-coach.vercel.app/api/webhooks/google-transcript',

  // Secret token for authentication (same as GOOGLE_SCRIPT_SECRET in Vercel)
  WEBHOOK_SECRET: 'bf572dd994132459278aa494c130e0264e69b6defac150be231b328f887dc41d',

  // Label added to processed files to avoid re-sending
  PROCESSED_LABEL: '[SYNCED]',
};

// ============================================
// MAIN FUNCTION — Runs on timer
// ============================================

/**
 * Scans the transcript folder for new (unprocessed) Google Docs
 * and sends each one to the dashboard.
 */
function syncTranscripts() {
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);

  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();

    // Skip already-processed files
    if (fileName.startsWith(CONFIG.PROCESSED_LABEL)) {
      continue;
    }

    try {
      // Use Drive export API instead of DocumentApp.openById()
      // because Gemini "Notas de Gemini" docs cannot be opened by DocumentApp
      const exportUrl = 'https://docs.google.com/document/d/' + file.getId() + '/export?format=txt';
      const response = UrlFetchApp.fetch(exportUrl, {
        headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true,
      });
      if (response.getResponseCode() !== 200) {
        Logger.log('Cannot export ' + fileName + ' (code ' + response.getResponseCode() + '), skipping');
        continue;
      }
      const transcript = response.getContentText();

      // Skip empty docs
      if (!transcript || transcript.trim().length === 0) {
        Logger.log('Skipping empty doc: ' + fileName);
        continue;
      }

      // Extract info from the file name and metadata
      const callDate = extractDateFromFile(file);
      const clientName = extractClientName(fileName);

      // Try to extract a Google Meet link from the transcript content
      const meetLink = extractMeetLinkFromTranscript(transcript);

      // If filename didn't give us a client name, try extracting from transcript content
      let finalClientName = clientName;
      if (!finalClientName.firstName) {
        finalClientName = extractClientNameFromTranscript(transcript);
      }

      // Build the payload
      const payload = {
        google_event_id: file.getId(),
        transcript: transcript.substring(0, 50000), // Respect 50KB limit
        call_date: callDate,
        duration_minutes: 15,
      };

      if (meetLink) {
        payload.meet_link = meetLink;
      }

      if (finalClientName.firstName) {
        payload.client_first_name = finalClientName.firstName;
      }
      if (finalClientName.lastName) {
        payload.client_last_name = finalClientName.lastName;
      }

      // Send to dashboard
      const success = sendToDashboard(payload);

      if (success) {
        // Rename file to mark as processed
        file.setName(CONFIG.PROCESSED_LABEL + ' ' + fileName);
        Logger.log('Synced: ' + fileName);
      } else {
        Logger.log('Failed to sync: ' + fileName);
      }
    } catch (e) {
      Logger.log('Error processing ' + fileName + ': ' + e.message);
    }
  }
}

// ============================================
// HTTP — Send transcript to dashboard
// ============================================

function sendToDashboard(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + CONFIG.WEBHOOK_SECRET,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
  const code = response.getResponseCode();

  if (code >= 200 && code < 300) {
    const body = JSON.parse(response.getContentText());
    Logger.log('Dashboard response: ' + JSON.stringify(body));
    return true;
  } else {
    Logger.log('Dashboard error (' + code + '): ' + response.getContentText());
    return false;
  }
}

// ============================================
// HELPERS — Extract data from file
// ============================================

/**
 * Try to extract a date from the file creation date.
 * Returns YYYY-MM-DD format.
 */
function extractDateFromFile(file) {
  const created = file.getDateCreated();
  return Utilities.formatDate(created, 'America/Mexico_City', 'yyyy-MM-dd');
}

/**
 * Try to extract client name from the transcript file name.
 *
 * Known Gemini filename formats:
 *   "Marcel Despagne y Tony Tirado Zalud: 2026/03/20 14:32 CST - Notas de Gemini"
 *   "La reunión se inició a las 2026/03/20 15:01 CST - Notas de Gemini"
 *   "Davide x Tony Zalud: 2026/03/03 12:11 CST - Notas de Gemini"
 *   "Carlos Garcia y Tony Zalud"  (newer, cleaner format)
 *   "Carlos Garcia y Tony Zalud - Notas de Gemini"
 *   "Carlos Garcia - Tony Zalud"
 *
 * Strategy: clean suffixes, split by separator to get participants,
 * identify client (non-coach) participant.
 */
function extractClientName(fileName) {
  // Remove common suffixes (order matters — most specific first)
  var cleaned = fileName
    .replace(/\s*-\s*Notas de Gemini\s*$/i, '')
    .replace(/\s*-\s*Gemini Notes\s*$/i, '')
    .replace(/\s*Notas de Gemini\s*$/i, '')
    .trim();

  // Remove date suffix in various formats
  // "...: 2026/03/20 14:32 CST" or "...: 2026-03-20 14:32" or just trailing date
  cleaned = cleaned
    .replace(/[:\-]\s*\d{4}[\/\-]\d{2}[\/\-]\d{2}\s+\d{2}:\d{2}(?:\s+\w+)?\s*$/, '')
    .replace(/\s+\d{4}[\/\-]\d{2}[\/\-]\d{2}\s*$/, '')
    .trim();

  // Skip files that start with "La reunión se inició" — no client name
  if (/^La reunión se inició/i.test(cleaned)) {
    return { firstName: null, lastName: null };
  }

  // Known coach names (lowercase) to identify which participant is the client
  var coachNames = ['tony', 'antonio', 'tirado', 'zalud', 'admisiones', 'andrés', 'andres'];

  // Split by common separators: " y ", " x ", " - ", " & ", " con "
  var participants = cleaned.split(/\s+(?:y|x|&|con)\s+|\s+-\s+/i);

  // Find the first participant that is NOT a coach
  for (var i = 0; i < participants.length; i++) {
    var part = participants[i].trim();
    if (!part || part.length < 2) continue;

    // Check if this participant contains a coach name
    var partLower = part.toLowerCase();
    var isCoach = false;
    for (var j = 0; j < coachNames.length; j++) {
      if (partLower.indexOf(coachNames[j]) !== -1) {
        isCoach = true;
        break;
      }
    }

    if (!isCoach) {
      var parts = part.split(/\s+/);
      return {
        firstName: parts[0] || null,
        lastName: parts.slice(1).join(' ') || null,
      };
    }
  }

  // Fallback: if all participants matched coach names, use the first one anyway
  var fallback = (participants[0] || '').trim();
  if (fallback && fallback.length >= 2) {
    var parts = fallback.split(/\s+/);
    return {
      firstName: parts[0] || null,
      lastName: parts.slice(1).join(' ') || null,
    };
  }

  return { firstName: null, lastName: null };
}

// ============================================
// HELPERS — Extract data from transcript content
// ============================================

/**
 * Try to extract a Google Meet link from the transcript content.
 * Gemini notes sometimes include the meet link in the document body.
 */
function extractMeetLinkFromTranscript(transcript) {
  var match = transcript.match(/https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i);
  return match ? match[0] : null;
}

/**
 * Try to extract the client (non-coach) participant name from transcript content.
 * Gemini notes often list participants at the top, e.g.:
 *   "Participantes: Marcel Despagne, Tony Tirado Zalud"
 *   "Asistentes: Elvis Florentino, Tony Zalud"
 *
 * We look for participant lines and exclude known coach names.
 */
function extractClientNameFromTranscript(transcript) {
  // Known coach names to exclude (case-insensitive)
  var coachNames = ['tony', 'antonio', 'tirado', 'zalud', 'admisiones', 'andrés', 'andres'];

  // Try multiple patterns for participant lists
  var patterns = [
    /(?:participantes|asistentes|attendees|speakers?)[:\s]+([^\n]+)/i,
    /(?:personas en la llamada|people in call)[:\s]+([^\n]+)/i,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = transcript.match(patterns[i]);
    if (match) {
      var participantLine = match[1].trim();
      // Split by comma, "y", "and", "&"
      var names = participantLine.split(/\s*[,&]\s*|\s+y\s+|\s+and\s+/);

      for (var j = 0; j < names.length; j++) {
        var name = names[j].trim();
        if (!name || name.length < 2) continue;

        // Check if this is a coach name
        var isCoach = false;
        var nameLower = name.toLowerCase();
        for (var k = 0; k < coachNames.length; k++) {
          if (nameLower.indexOf(coachNames[k]) !== -1) {
            isCoach = true;
            break;
          }
        }

        if (!isCoach) {
          var parts = name.split(/\s+/);
          return {
            firstName: parts[0] || null,
            lastName: parts.slice(1).join(' ') || null,
          };
        }
      }
    }
  }

  // Fallback: look for speaker labels in the transcript body like "Marcel:" or "[Marcel Despagne]"
  var speakerMatch = transcript.match(/^[\[\(]?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\s*[\]\)]?\s*:/m);
  if (speakerMatch) {
    var speakerName = speakerMatch[1].trim();
    var speakerLower = speakerName.toLowerCase();
    var isCoachSpeaker = false;
    for (var m = 0; m < coachNames.length; m++) {
      if (speakerLower.indexOf(coachNames[m]) !== -1) {
        isCoachSpeaker = true;
        break;
      }
    }
    if (!isCoachSpeaker) {
      var speakerParts = speakerName.split(/\s+/);
      return {
        firstName: speakerParts[0] || null,
        lastName: speakerParts.slice(1).join(' ') || null,
      };
    }
  }

  return { firstName: null, lastName: null };
}

// ============================================
// SETUP — Run once to create the timer trigger
// ============================================

/**
 * Run this function ONCE to set up automatic syncing every 10 minutes.
 * Go to Run → setupTrigger in the Apps Script editor.
 */
function setupTrigger() {
  // Remove any existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'syncTranscripts') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create new trigger: every 10 minutes
  ScriptApp.newTrigger('syncTranscripts')
    .timeBased()
    .everyMinutes(10)
    .create();

  Logger.log('Trigger created: syncTranscripts will run every 10 minutes');
}

/**
 * Run this ONCE to re-process all previously synced transcripts.
 * Removes the [SYNCED] prefix from all files and runs syncTranscripts()
 * so they get re-sent to the dashboard (which will regenerate coach actions).
 */
function resyncAll() {
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  var count = 0;

  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();

    if (name.startsWith(CONFIG.PROCESSED_LABEL)) {
      const newName = name.replace(CONFIG.PROCESSED_LABEL + ' ', '');
      file.setName(newName);
      count++;
      Logger.log('Unmarked: ' + newName);
    }
  }

  Logger.log('Unmarked ' + count + ' files. Now running syncTranscripts()...');
  syncTranscripts();
}

/**
 * Run this to test with a single file without marking it as processed.
 */
function testWithoutMarking() {
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);

  if (files.hasNext()) {
    const file = files.next();
    const exportUrl = 'https://docs.google.com/document/d/' + file.getId() + '/export?format=txt';
    const response = UrlFetchApp.fetch(exportUrl, {
      headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    const transcript = response.getResponseCode() === 200
      ? response.getContentText()
      : '(export failed: ' + response.getResponseCode() + ')';

    Logger.log('File: ' + file.getName());
    Logger.log('Transcript preview: ' + transcript.substring(0, 500));
    Logger.log('Date: ' + extractDateFromFile(file));
    Logger.log('Client: ' + JSON.stringify(extractClientName(file.getName())));
  } else {
    Logger.log('No Google Docs found in the folder');
  }
}
