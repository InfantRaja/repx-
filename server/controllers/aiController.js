/**
 * REPX AI Coach & Fitness Intelligence Controller
 * Provides athletic coaching, biomechanical form advice, split recommendations,
 * nutrition guidance, and answers to all gym and fitness doubts.
 */

// Comprehensive knowledge base for athletic coaching
const EXERCISE_KNOWLEDGE = {
  bench: {
    title: 'Bench Press Biomechanics & Form',
    cues: [
      'Setup: Eyes directly below the bar, plant feet firmly into the floor.',
      'Grip: 1.5× shoulder width with wrists stacked straight over elbows (no bent wrists).',
      'Arch & Scapula: Retract and depress shoulder blades into the bench to protect rotator cuffs.',
      'Bar Path: Touch mid-to-lower sternum at a 45–70° elbow angle, press up and slightly backward over shoulders.',
      'Leg Drive: Push through your heels without lifting your glutes off the bench pad.'
    ],
    plateauTips: 'Incorporate paused bench presses (2-sec pause on chest), close-grip bench for triceps lockout strength, and heavy dumbbell overhead presses.'
  },
  squat: {
    title: 'Barbell Squat Biomechanics & Form',
    cues: [
      'Foot Stance: Shoulder-width or slightly wider, toes flared 15–30° outward.',
      'Bracing: Take a deep diaphragmatic breath into your belt/belly (Valsalva maneuver) before descending.',
      'Descent: Break at hips and knees simultaneously. Push knees in the direction of your toes.',
      'Depth: Break parallel (hip crease lower than top of knee) while maintaining a neutral spine.',
      'Ascent: Drive straight through mid-foot and spread the floor with your shoes.'
    ],
    plateauTips: 'Work on tempo squats (3 seconds down) and pause squats at the bottom hole to eliminate bounce reliance.'
  },
  deadlift: {
    title: 'Deadlift Setup & Technique',
    cues: [
      'Bar Placement: Bar directly over mid-foot (1 inch from shins while standing).',
      'Hinge: Hinge at the hips without squatting down. Grab bar just outside shins.',
      'Slack: Pull the slack out of the barbell until you hear the click before breaking the floor.',
      'Chest Up: Wedge your hips in, lock lats back like bending the bar around your shins.',
      'Lockout: Stand tall by squeezing glutes; do not hyperextend your lower back at the top.'
    ],
    plateauTips: 'Incorporate Romanian Deadlifts (RDLs) for hamstring/glute hypertrophy, and deficit deadlifts for power off the floor.'
  },
  overhead: {
    title: 'Overhead Press (OHP) Masterclass',
    cues: [
      'Grip: Just outside shoulders with vertical forearms in the front rack position.',
      'Core & Glutes: Squeeze glutes and brace abs rock-hard to prevent lumbar hyperextension.',
      'Head Path: Pull chin back slightly as the bar passes your nose, then push head through under the bar at lockout.',
      'Lockout: Shrug shoulders up slightly at top lockout to stabilize the scapula.'
    ],
    plateauTips: 'Add seated dumbbell presses, lateral raises for side delt volume, and push presses for overload.'
  }
};

const NUTRITION_KNOWLEDGE = {
  preworkout: [
    'Timing: Eat a balanced meal 2–3 hours before training, or a light snack 30–60 mins prior.',
    'Carbohydrates: 30–50g fast/medium digesting carbs (oatmeal, banana, rice cakes, toast with honey) to top up muscle glycogen.',
    'Protein: 20–30g easily digestible protein (whey isolate, eggs, Greek yogurt).',
    'Hydration: Drink 400–500ml of water with a pinch of sea salt for optimum muscle pumps and cellular hydration.'
  ],
  postworkout: [
    'Protein: 25–40g high-quality complete protein within 1–2 hours post-workout to trigger Muscle Protein Synthesis (MPS).',
    'Carbs: 40–80g complex carbohydrates (rice, potatoes, oats) to replenish depleted glycogen stores.',
    'Creatine: 3–5g of Creatine Monohydrate daily (any time of day) for adenosine triphosphate (ATP) resynthesis.'
  ],
  proteinTarget: 'For maximum muscle hypertrophy, aim for 1.6g to 2.2g of protein per kg of body weight (approx 0.8g–1.0g per lb).'
};

/**
 * Intelligent athletic coaching response generator
 */
function generateCoachResponse(message, context = {}) {
  const text = message.toLowerCase().trim();
  const userName = context.name || 'Athlete';
  const goal = context.fitnessGoal || 'Strength & Hypertrophy';
  const level = context.experienceLevel || 'Intermediate';

  // 1. Bench Press questions
  if (text.includes('bench') || text.includes('chest press') || text.includes('increase bench')) {
    const k = EXERCISE_KNOWLEDGE.bench;
    return `### 🏋️‍♂️ ${k.title} for ${userName}

Here are the biomechanical execution keys to maximize your bench press and prevent shoulder impingement:

${k.cues.map(c => `• **${c.split(':')[0]}:** ${c.split(':')[1]}`).join('\n')}

💡 **How to Break Your Plateau:**
${k.plateauTips}

⚡ **Pro Tip:** In REPX, you can log your sets with your voice by saying *"Bench press 4 sets 10 reps 80 kg"* inside the workout session!`;
  }

  // 2. Squat questions
  if (text.includes('squat') || text.includes('legs') || text.includes('knee cave') || text.includes('depth')) {
    const k = EXERCISE_KNOWLEDGE.squat;
    return `### 🦵 ${k.title}

Here is how to build bulletproof squat depth and protect your knees:

${k.cues.map(c => `• **${c.split(':')[0]}:** ${c.split(':')[1]}`).join('\n')}

💡 **Overcoming Weak Points:**
${k.plateauTips}

⚡ **Target Depth:** Ensure your hip crease drops below the top of your knee joint. If ankle mobility is tight, elevate heels slightly on 1.25kg plates.`;
  }

  // 3. Deadlift questions
  if (text.includes('deadlift') || text.includes('lower back') || text.includes('rdl')) {
    const k = EXERCISE_KNOWLEDGE.deadlift;
    return `### ⚡ ${k.title}

Deadlifts build the ultimate posterior chain strength when executed with strict biomechanics:

${k.cues.map(c => `• **${c.split(':')[0]}:** ${c.split(':')[1]}`).join('\n')}

🛡️ **Lower Back Protection:** Never round your lumbar spine. Push the floor away rather than pulling the bar up with your arms.`;
  }

  // 4. Overhead Press / Shoulders
  if (text.includes('overhead press') || text.includes('shoulder press') || text.includes('ohp') || text.includes('delts')) {
    const k = EXERCISE_KNOWLEDGE.overhead;
    return `### 🎯 ${k.title}

${k.cues.map(c => `• **${c.split(':')[0]}:** ${c.split(':')[1]}`).join('\n')}

💡 **Plateau Strategy:**
${k.plateauTips}`;
  }

  // 5. Progressive Overload
  if (text.includes('progressive overload') || text.includes('plateau') || text.includes('how to progress')) {
    return `### 📈 Progressive Overload Masterclass

Progressive overload is the fundamental driver of muscle hypertrophy and strength adaptation. There are 5 primary ways to implement it in REPX:

1. **Increase Resistance (Weight):** Add 1.25kg – 2.5kg once you hit the top of your target rep range.
2. **Increase Repetitions:** If your goal is 8–10 reps and you hit 8 today, aim for 9 next week with the same weight.
3. **Increase Set Volume:** Progress from 3 sets to 4 sets across the training mesocycle.
4. **Improve Mechanical Tempo:** Take 3 seconds on the eccentric (lowering) phase for greater muscle micro-tears.
5. **Shorten Rest Periods:** Reduce rest between sets from 90s to 75s while sustaining the same weight.

Track every single session in **REPX Workouts** to let the automated PR detector alert you when you break personal records!`;
  }

  // 6. Pre/Post Workout Nutrition & Diet
  if (text.includes('eat') || text.includes('food') || text.includes('diet') || text.includes('nutrition') || text.includes('pre-workout') || text.includes('post-workout') || text.includes('protein')) {
    return `### 🥗 Athletic Nutrition & Fueling Blueprint

Based on your profile (*${level}* focusing on *${goal}*):

**🥣 Pre-Workout Fuel (30–90 mins before training):**
${NUTRITION_KNOWLEDGE.preworkout.map(item => `• ${item}`).join('\n')}

**🥩 Post-Workout Recovery (within 1–2 hours):**
${NUTRITION_KNOWLEDGE.postworkout.map(item => `• ${item}`).join('\n')}

**📊 Daily Target:**
• ${NUTRITION_KNOWLEDGE.proteinTarget}
• Consume 3–4 liters of water daily to maintain cellular hydration and muscular force output.`;
  }

  // 7. Workout Splits (PPL, Upper Lower, etc.)
  if (text.includes('split') || text.includes('routine') || text.includes('ppl') || text.includes('how many days') || text.includes('program')) {
    return `### 📅 Recommended Workout Splits for ${userName}

For your goal of **${goal}**, here are the most effective splits:

1. **Push Pull Legs (PPL) — 3 to 6 Days / Week (Most Popular):**
   • **Push:** Chest, Shoulders, Triceps (Bench Press, Incline Press, Lateral Raises, Dips)
   • **Pull:** Back, Biceps, Rear Delts (Deadlifts, Pull-ups, Barbell Rows, Bicep Curls)
   • **Legs:** Quads, Hamstrings, Calves, Core (Squats, RDLs, Leg Press, Planks)

2. **Upper / Lower Split — 4 Days / Week (Optimal for Busy Schedules):**
   • Mon: Upper Power | Tue: Lower Power | Thu: Upper Hypertrophy | Fri: Lower Hypertrophy

3. **Full Body — 3 Days / Week (High Frequency):**
   • Mon / Wed / Fri: 1 compound squat, 1 compound press, 1 compound pull each session.

💡 You can configure your complete 7-day program in the **REPX Split Builder** right now!`;
  }

  // 8. Rest between sets
  if (text.includes('rest') || text.includes('how long rest') || text.includes('between sets')) {
    return `### ⏱️ Optimal Rest Intervals Between Sets

Rest duration dictates energy system replenishment (ATP-CP regeneration):

• **Heavy Compound Strength (1–5 Reps @ RPE 8–10):**
  **2.5 to 4 Minutes.** Necessary to restore 95%+ of intramuscular ATP and maintain high motor-unit recruitment.
• **Hypertrophy Muscle Growth (6–12 Reps @ RPE 7–9):**
  **90 to 120 Seconds.** The sweet spot for metabolic stress, mechanical tension, and local muscle recovery.
• **Isolation & Pump Accessories (12–20 Reps):**
  **45 to 60 Seconds.** Maximizes cell swelling, vascular pump, and workout density.

⚡ **REPX Feature:** Use the interactive **Rest Timer** in your live workout session—it plays audio synthesizer chimes when your countdown expires!`;
  }

  // 9. Recovery & Muscle Soreness (DOMS)
  if (text.includes('sore') || text.includes('doms') || text.includes('recovery') || text.includes('rest day') || text.includes('sleep')) {
    return `### 🛌 Muscle Recovery & DOMS Protocol

Delayed Onset Muscle Soreness (DOMS) is normal micro-trauma after intense eccentric loading:

1. **Active Recovery:** Light 20-min brisk walk or low-intensity cycling increases blood circulation and clears metabolic waste.
2. **Sleep Hygiene:** 7.5 to 9 hours of quality sleep is when 80%+ of growth hormone (HGH) is released.
3. **Contrast Showers / Sauna:** Alternating hot and cold water boosts blood perfusion.
4. **Hydration & Electrolytes:** Ensure sodium, potassium, and magnesium intake are sufficient.
5. **Deload Schedule:** Take 1 light deload week every 6–8 weeks (cut volume by 40%, keep intensity moderate).`;
  }

  // 10. REPX App Usage & Voice Commands
  if (text.includes('repx') || text.includes('voice') || text.includes('how to use') || text.includes('app')) {
    return `### 🎙️ How to Maximize REPX

REPX is equipped with advanced gym telemetry:

• **Voice Commands:** Tap the **"🎙️ Voice Command"** button in the header and speak naturally:
  - *"Show my workouts"*
  - *"Show exercises"*
  - *"Open push workout"*
  - *"Start workout"*
  - *"Show my dashboard"*
• **Voice Workout Logging:** While logging sets in the gym, tap **"Voice Log"** and speak:
  - *"4 sets 10 reps 80 kg"*
  - *"Bench press 4 sets 10 reps 80 kg"*
• **Automated PR Engine:** Calculates your estimated 1RM using the Epley formula (\`Weight × (1 + Reps/30)\`) and issues PR badges!`;
  }

  // Default fallback guidance
  return `### 💡 REPX AI Coach Advice for ${userName}

Regarding *"**${message}**"*:

Here are 3 core training principles to guide you:

1. **Intentional Form:** Prioritize a full active range of motion with strict eccentric control (2–3 seconds down, explosive concentric).
2. **Structured Overload:** Focus on making progress week-over-week in either weight, reps, or set quality.
3. **Nutritional Recovery:** Ensure you are getting adequate protein (1.6–2.2g/kg) and restful sleep (7–9 hours).

Ask me anything specific about **Bench Press**, **Squats**, **Deadlifts**, **Pre-workout Nutrition**, **Push Pull Legs Splits**, or **Rest Periods**!`;
}

// @desc    Chat with REPX AI Coach
// @route   POST /api/ai/coach
// @access  Public / Private
export const chatWithCoach = async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for the AI Coach.'
      });
    }

    const response = generateCoachResponse(message, context);

    return res.status(200).json({
      success: true,
      reply: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Coach Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error communicating with AI Coach',
      error: error.message
    });
  }
};
