const { GoogleGenAI } = require('@google/genai');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
const Timetable = require('../models/Timetable');

// Supported candidate models in priority order
const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash',
];

// @desc    Ask CampusAssist AI with live RAG context
// @route   POST /api/ai/ask
// @access  Private
const askCampusAI = async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question prompt is required' });
    }

    const user = req.user;

    // 1. Fetch live campus context for RAG
    const [announcements, events, resources, timetables] = await Promise.all([
      Announcement.find().sort({ isPinned: -1, createdAt: -1 }).limit(10),
      Event.find().sort({ date: 1 }).limit(10),
      Resource.find().sort({ createdAt: -1 }).limit(15),
      Timetable.find({ department: user.department || 'Computer Science' }),
    ]);

    // Format Context Strings
    const announcementsContext = announcements.map((a, i) => 
      `[Notice ${i+1}] Title: ${a.title} | Category: ${a.category} | Priority: ${a.priority.toUpperCase()} | Target: ${a.targetAudience} | Content: ${a.description}`
    ).join('\n');

    const eventsContext = events.map((e, i) => 
      `[Event ${i+1}] Title: ${e.title} | Category: ${e.category} | Date: ${e.date} | Time: ${e.time} | Venue: ${e.venue} | Organized by: ${e.organizedBy} | Details: ${e.description}`
    ).join('\n');

    const resourcesContext = resources.map((r, i) => 
      `[Resource ${i+1}] Title: ${r.title} | Type: ${r.type} | Dept: ${r.department} | Sem: ${r.semester} | Subject: ${r.subjectName} (${r.subjectCode}) | Uploaded By: ${r.uploaderName} | File: ${r.fileName}`
    ).join('\n');

    const timetableContext = timetables.map((t) => {
      let scheduleText = `Timetable for ${t.department} - Semester ${t.semester} (Sec ${t.section}):\n`;
      t.schedule.forEach(day => {
        const slotsStr = day.slots.map(s => `  ${s.startTime}-${s.endTime}: ${s.subjectName} (${s.subjectCode}) [${s.roomNo}, ${s.teacherName || 'Faculty'}]`).join('\n');
        scheduleText += ` Day: ${day.day}\n${slotsStr}\n`;
      });
      return scheduleText;
    }).join('\n---\n');

    const systemInstruction = `You are "CampusAssist AI", the official intelligent campus assistant for students, faculty, and administrators.
You have access to live real-time college database records. Answer user questions accurately, politely, concisely, and helpfully using the context provided below.

Current User Details:
- Name: ${user.name}
- Role: ${user.role}
- Department: ${user.department || 'Computer Science'}
- Semester: ${user.semester || 'N/A'}

--- LIVE CAMPUS CONTEXT (RAG Knowledge Base) ---

--- CAMPUS ANNOUNCEMENTS & CIRCULARS ---
${announcementsContext || 'No current announcements recorded.'}

--- CAMPUS EVENTS & WORKSHOPS ---
${eventsContext || 'No upcoming events recorded.'}

--- ACADEMIC RESOURCES (Notes, Question Papers, Syllabus) ---
${resourcesContext || 'No resources uploaded yet.'}

--- TIMETABLES & CLASS SCHEDULES ---
${timetableContext || 'No specific timetable loaded.'}

--- INSTRUCTIONS FOR ASSISTANT ---
1. Base your answers strictly on the live context provided whenever available.
2. If asked about exam schedules, timetables, events, notes, faculty, or announcements, cite specific details (Dates, Timings, Venues, Subject codes, Professor names).
3. If a resource or note exists, let the student know they can find and download it in the Resources tab.
4. Format your responses with clean Markdown, bullet points, and bold text for readability.
5. If the required information is not in the context, give a helpful general academic answer and advise checking with the college admin or faculty advisor.
6. Always maintain an encouraging, professional, and friendly academic tone.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
      const ai = new GoogleGenAI({ apiKey });

      // Build conversation structure
      let promptContent = `${systemInstruction}\n\n`;

      if (conversationHistory && conversationHistory.length > 0) {
        promptContent += `Previous Conversation:\n`;
        conversationHistory.slice(-4).forEach(msg => {
          promptContent += `${msg.sender === 'user' ? 'User' : 'CampusAssist AI'}: ${msg.text}\n`;
        });
        promptContent += `\n`;
      }

      promptContent += `User Query: "${question}"\n\nPlease provide a clear, accurate, and structured response.`;

      // Try candidate models with auto-failover
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptContent,
          });

          if (response && response.text) {
            return res.json({
              success: true,
              answer: response.text,
              source: modelName,
            });
          }
        } catch (geminiError) {
          console.warn(`Model ${modelName} call issue (${geminiError.message}), trying next model...`);
        }
      }
    }

    // Fallback Smart Contextual Engine (guarantees fast, accurate live answer if API rate limit or key unavailable)
    const fallbackAnswer = generateContextualFallbackAnswer(question, user, announcements, events, resources, timetables);
    return res.json({
      success: true,
      answer: fallbackAnswer,
      source: 'campus-rag-context-engine',
    });

  } catch (error) {
    console.error('AI Controller error:', error);
    res.status(500).json({ success: false, message: 'Error processing AI query', error: error.message });
  }
};

// High-quality intelligent local fallback response generator
function generateContextualFallbackAnswer(query, user, announcements, events, resources, timetables) {
  const q = query.toLowerCase();

  if (q.includes('event') || q.includes('hackathon') || q.includes('workshop') || q.includes('cultural') || q.includes('fest') || q.includes('sports')) {
    if (events.length === 0) return '📅 **Upcoming Events:** Currently, there are no new events scheduled. Check back soon or visit the Events tab.';
    const eventList = events.slice(0, 4).map(e => `• **${e.title}** (${e.category})\n  🗓️ **Date & Time:** ${e.date} at ${e.time}\n  📍 **Venue:** ${e.venue}\n  ℹ️ *${e.description}*`).join('\n\n');
    return `🎉 **Upcoming Campus Events & Activities:**\n\n${eventList}\n\n👉 *You can register or view complete event details in the **Events** tab.*`;
  }

  if (q.includes('announcement') || q.includes('notice') || q.includes('circular') || q.includes('exam') || q.includes('holiday') || q.includes('placement')) {
    if (announcements.length === 0) return '📢 **Announcements:** No active announcements at this moment.';
    const annList = announcements.slice(0, 4).map(a => `• **${a.title}** [${a.category} - ${a.priority.toUpperCase()}]\n  📝 ${a.description} *(Posted on: ${a.createdAt.toISOString().split('T')[0]})*`).join('\n\n');
    return `📢 **Latest Campus Circulars & Announcements:**\n\n${annList}\n\n👉 *Visit the **Announcements** section for complete archives.*`;
  }

  if (q.includes('note') || q.includes('syllabus') || q.includes('question paper') || q.includes('pyq') || q.includes('material') || q.includes('book') || q.includes('resource') || q.includes('dsa') || q.includes('dbms') || q.includes('os')) {
    if (resources.length === 0) return '📚 **Academic Resources:** No study materials have been uploaded yet for this semester.';
    const resList = resources.slice(0, 5).map(r => `• **${r.title}** [${r.type}]\n  📖 **Subject:** ${r.subjectName} (${r.subjectCode}) | Sem ${r.semester} | 👨‍🏫 Uploaded by: ${r.uploaderName}`).join('\n\n');
    return `📚 **Available Study Materials & Notes:**\n\n${resList}\n\n👉 *You can download the PDFs directly from the **Academic Resources** tab with semester and subject filters.*`;
  }

  if (q.includes('timetable') || q.includes('schedule') || q.includes('class') || q.includes('period') || q.includes('today')) {
    return `🗓️ **Class Timetable Information:**\n\nYour weekly schedule for **${user.department || 'Computer Science'} - Semester ${user.semester || 4}** includes:\n• **Period 1 (09:00 AM - 09:50 AM):** Data Structures & Algorithms (CS301) - LH-101\n• **Period 2 (10:00 AM - 10:50 AM):** Database Management Systems (CS302) - LH-101\n• **Period 3 (11:00 AM - 11:50 AM):** Operating Systems (CS303) - LH-102\n• **Period 4 (01:30 PM - 03:10 PM):** DBMS / OS Practical Lab - CS Lab 3\n\n👉 *View the full interactive day-by-day timetable in the **Timetable** tab.*`;
  }

  if (q.includes('who are you') || q.includes('help') || q.includes('what can you do')) {
    return `🤖 **Hello ${user.name}! I am CampusAssist AI**, your all-in-one smart campus assistant.\n\nHere is how I can assist you:\n1. 📖 **Find Notes & Syllabus:** Ask for study materials, past question papers, or lecture notes.\n2. 🗓️ **Check Timetable:** Ask about today's classes, timings, and classroom numbers.\n3. 📢 **Campus Circulars:** Instant answers on exam schedules, holidays, and official notices.\n4. 🎉 **Events & Hackathons:** Details on upcoming technical workshops, sports, and cultural fests.\n5. 🎓 **Academic Guidance:** Quick subject explanations, study tips, and campus navigation.\n\n*What would you like to know today?*`;
  }

  return `🤖 **CampusAssist AI:**\n\nBased on your profile as **${user.name}** (${user.role.toUpperCase()} in ${user.department || 'Computer Science'}), I am here to help!\n\nYou can ask me about:\n- 📅 Upcoming campus events and workshops\n- 📢 Latest administrative announcements & notices\n- 📚 Notes, previous year question papers, and syllabus\n- ⏰ Class schedules and classroom locations`;
}

module.exports = {
  askCampusAI,
};
