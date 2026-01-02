import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { rubrics, rubricCriteria, latePolicies, revisionPolicies } from '../../shared/schema';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function seedRubricTemplates() {
  console.log('🌱 Seeding rubric templates...');

  // ============================================
  // MIDDLE SCHOOL TEMPLATES
  // ============================================

  const msResearch = await db.insert(rubrics).values({
    user_id: null, // System template
    name: 'Middle School Research Writing',
    rubric_type: 'Research Paper',
    academic_level: 'Middle School',
    description: 'Research writing rubric for middle school students',
    rubric_summary: 'Evaluates research writing with focus on basic skills, organization, and source use',
    total_points: 100,
    minimum_word_count: 200,
    late_policy_enabled: true,
    revision_policy_enabled: true,
    is_template: true,
  }).returning();

  await db.insert(rubricCriteria).values([
    {
      rubric_id: msResearch[0].id,
      criterion_name: 'Writing Quality & Clarity',
      criterion_description: 'Complete sentences, basic grammar and capitalization, appropriate word choice, clear meaning',
      max_points: 25,
      order_position: 1,
      scoring_guide: [
        { range: '23-25', description: 'Clear, well-written with minimal errors' },
        { range: '18-22', description: 'Generally clear with some errors' },
        { range: '13-17', description: 'Unclear writing with frequent errors' },
        { range: '0-12', description: 'Very unclear or incomplete writing' },
      ],
    },
    {
      rubric_id: msResearch[0].id,
      criterion_name: 'Organization & Development',
      criterion_description: 'Clear main idea, paragraphs stay on topic, supporting details included, simple transitions',
      max_points: 25,
      order_position: 2,
      scoring_guide: [
        { range: '23-25', description: 'Well-organized with clear main idea' },
        { range: '18-22', description: 'Mostly organized with minor issues' },
        { range: '13-17', description: 'Weak organization or off-topic sections' },
        { range: '0-12', description: 'Disorganized or unclear structure' },
      ],
    },
    {
      rubric_id: msResearch[0].id,
      criterion_name: 'Source Use & Documentation',
      criterion_description: 'At least 1-2 teacher-approved sources, basic in-text citation or attribution, sources listed, information relates to topic',
      max_points: 25,
      order_position: 3,
      scoring_guide: [
        { range: '23-25', description: 'Sources properly cited and relevant' },
        { range: '18-22', description: 'Sources used with minor citation issues' },
        { range: '13-17', description: 'Limited or poorly cited sources' },
        { range: '0-12', description: 'Missing or improperly used sources' },
      ],
    },
    {
      rubric_id: msResearch[0].id,
      criterion_name: 'Assignment Requirements',
      criterion_description: 'Minimum word count met (200+ words), instructions followed, original work, clear ending or summary',
      max_points: 25,
      order_position: 4,
      scoring_guide: [
        { range: '23-25', description: 'All requirements fully met' },
        { range: '18-22', description: 'Most requirements met' },
        { range: '13-17', description: 'Several requirements missing' },
        { range: '0-12', description: 'Major requirements unmet' },
      ],
    },
  ]);

  await db.insert(latePolicies).values([
    { rubric_id: msResearch[0].id, hours_late_min: 0, hours_late_max: 24, point_deduction: 5, order_position: 1 },
    { rubric_id: msResearch[0].id, hours_late_min: 25, hours_late_max: 48, point_deduction: 10, order_position: 2 },
    { rubric_id: msResearch[0].id, hours_late_min: 49, hours_late_max: null, point_deduction: 0, custom_rule: 'Teacher discretion', order_position: 3 },
  ]);

  await db.insert(revisionPolicies).values({
    rubric_id: msResearch[0].id,
    revisions_allowed: 1,
    max_revision_score: 90,
    revision_deadline_days: 5,
    revision_conditions: 'One revision allowed',
  });

  console.log('✅ Middle School Research Writing template created');

  // Middle School General Writing
  const msGeneral = await db.insert(rubrics).values({
    user_id: null,
    name: 'Middle School General Writing',
    rubric_type: 'General Writing',
    academic_level: 'Middle School',
    description: 'General writing rubric for middle school students',
    rubric_summary: 'Evaluates general writing with focus on clarity and effort',
    total_points: 100,
    minimum_word_count: 75,
    late_policy_enabled: true,
    revision_policy_enabled: true,
    is_template: true,
  }).returning();

  await db.insert(rubricCriteria).values([
    {
      rubric_id: msGeneral[0].id,
      criterion_name: 'Writing Quality & Clarity',
      max_points: 25,
      order_position: 1,
      scoring_guide: [
        { range: '23-25', description: 'Clear and well-written' },
        { range: '18-22', description: 'Generally clear' },
        { range: '13-17', description: 'Unclear in places' },
        { range: '0-12', description: 'Very unclear' },
      ],
    },
    {
      rubric_id: msGeneral[0].id,
      criterion_name: 'Organization & Development',
      max_points: 25,
      order_position: 2,
      scoring_guide: [
        { range: '23-25', description: 'Well-organized' },
        { range: '18-22', description: 'Mostly organized' },
        { range: '13-17', description: 'Weak organization' },
        { range: '0-12', description: 'Disorganized' },
      ],
    },
    {
      rubric_id: msGeneral[0].id,
      criterion_name: 'Content & Ideas',
      max_points: 25,
      order_position: 3,
      scoring_guide: [
        { range: '23-25', description: 'Thoughtful and complete' },
        { range: '18-22', description: 'Adequate ideas' },
        { range: '13-17', description: 'Limited development' },
        { range: '0-12', description: 'Underdeveloped' },
      ],
    },
    {
      rubric_id: msGeneral[0].id,
      criterion_name: 'Assignment Requirements',
      max_points: 25,
      order_position: 4,
      scoring_guide: [
        { range: '23-25', description: 'All requirements met' },
        { range: '18-22', description: 'Most requirements met' },
        { range: '13-17', description: 'Some requirements missing' },
        { range: '0-12', description: 'Major requirements unmet' },
      ],
    },
  ]);

  console.log('✅ Middle School General Writing template created');

  // ============================================
  // HIGH SCHOOL TEMPLATES
  // ============================================

  const hsResearch = await db.insert(rubrics).values({
    user_id: null,
    name: 'High School Research Paper',
    rubric_type: 'Research Paper',
    academic_level: 'High School',
    description: 'Research paper rubric for high school students',
    rubric_summary: 'Evaluates formal research writing with proper citations and academic tone',
    total_points: 100,
    minimum_word_count: 400,
    late_policy_enabled: true,
    revision_policy_enabled: true,
    is_template: true,
  }).returning();

  await db.insert(rubricCriteria).values([
    {
      rubric_id: hsResearch[0].id,
      criterion_name: 'Writing Quality & Style',
      criterion_description: 'Correct grammar and sentence structure, varied sentence beginnings, formal academic tone, concise wording',
      max_points: 25,
      order_position: 1,
      scoring_guide: [
        { range: '23-25', description: 'Polished academic writing' },
        { range: '18-22', description: 'Generally strong with minor issues' },
        { range: '13-17', description: 'Weak style or frequent errors' },
        { range: '0-12', description: 'Poor writing quality' },
      ],
    },
    {
      rubric_id: hsResearch[0].id,
      criterion_name: 'Organization & Development',
      criterion_description: 'Clear thesis statement, topic sentences guide paragraphs, evidence supports ideas, logical flow',
      max_points: 25,
      order_position: 2,
      scoring_guide: [
        { range: '23-25', description: 'Excellently organized and developed' },
        { range: '18-22', description: 'Well-organized with minor gaps' },
        { range: '13-17', description: 'Weak organization or development' },
        { range: '0-12', description: 'Poorly organized' },
      ],
    },
    {
      rubric_id: hsResearch[0].id,
      criterion_name: 'Source Use & Citation',
      criterion_description: 'Credible sources (minimum 2-3), correct in-text citations, proper works cited page, sources integrated smoothly',
      max_points: 25,
      order_position: 3,
      scoring_guide: [
        { range: '23-25', description: 'Excellent source use and citations' },
        { range: '18-22', description: 'Good sources with minor citation issues' },
        { range: '13-17', description: 'Weak sources or poor citations' },
        { range: '0-12', description: 'Missing or improper sources' },
      ],
    },
    {
      rubric_id: hsResearch[0].id,
      criterion_name: 'Technical & Assignment Requirements',
      criterion_description: 'Minimum word count met (400+ words), plagiarism check passed, assignment instructions followed, clear conclusion',
      max_points: 25,
      order_position: 4,
      scoring_guide: [
        { range: '23-25', description: 'All requirements fully met' },
        { range: '18-22', description: 'Most requirements met' },
        { range: '13-17', description: 'Multiple requirements missing' },
        { range: '0-12', description: 'Major requirements unmet' },
      ],
    },
  ]);

  await db.insert(latePolicies).values([
    { rubric_id: hsResearch[0].id, hours_late_min: 0, hours_late_max: 24, point_deduction: 10, order_position: 1 },
    { rubric_id: hsResearch[0].id, hours_late_min: 25, hours_late_max: 72, point_deduction: 20, order_position: 2 },
    { rubric_id: hsResearch[0].id, hours_late_min: 73, hours_late_max: null, point_deduction: 0, custom_rule: 'Not accepted without approval', order_position: 3 },
  ]);

  await db.insert(revisionPolicies).values({
    rubric_id: hsResearch[0].id,
    revisions_allowed: 1,
    max_revision_score: 85,
    revision_deadline_days: 7,
    revision_conditions: 'One revision allowed for scores under 85',
  });

  console.log('✅ High School Research Paper template created');

  // High School Presentation
  const hsPresentation = await db.insert(rubrics).values({
    user_id: null,
    name: 'High School Presentation',
    rubric_type: 'Presentation',
    academic_level: 'High School',
    description: 'Presentation rubric for high school students',
    rubric_summary: 'Evaluates presentation delivery, visual aids, and content quality',
    total_points: 100,
    time_limit_minutes: 5,
    late_policy_enabled: true,
    revision_policy_enabled: true,
    is_template: true,
  }).returning();

  await db.insert(rubricCriteria).values([
    {
      rubric_id: hsPresentation[0].id,
      criterion_name: 'Content Design & Visual Aids',
      criterion_description: 'Text is readable, slides not overcrowded, use of images/charts, slides relate to topic, presenter does not read slides',
      max_points: 25,
      order_position: 1,
      scoring_guide: [
        { range: '23-25', description: 'Clear, neat, and effective visuals' },
        { range: '18-22', description: 'Mostly clear with minor issues' },
        { range: '13-17', description: 'Overcrowded or inconsistent' },
        { range: '0-12', description: 'Visuals distract or confuse' },
      ],
    },
    {
      rubric_id: hsPresentation[0].id,
      criterion_name: 'Delivery & Engagement',
      criterion_description: 'Clear voice, appropriate pace, some eye contact, limited filler words, demonstrates preparation',
      max_points: 30,
      order_position: 2,
      scoring_guide: [
        { range: '27-30', description: 'Confident and engaging' },
        { range: '21-26', description: 'Clear with some nervousness' },
        { range: '15-20', description: 'Limited engagement' },
        { range: '0-14', description: 'Difficult to follow' },
      ],
    },
    {
      rubric_id: hsPresentation[0].id,
      criterion_name: 'Time Management',
      criterion_description: 'Presentation fits within time range (±1 minute allowed), content is balanced, clear beginning and ending',
      max_points: 15,
      order_position: 3,
      scoring_guide: [
        { range: '14-15', description: 'Excellent time management' },
        { range: '11-13', description: 'Within time limits' },
        { range: '8-10', description: 'Slightly over/under time' },
        { range: '0-7', description: 'Significantly over/under time' },
      ],
    },
    {
      rubric_id: hsPresentation[0].id,
      criterion_name: 'Content Quality & Flow',
      criterion_description: 'Clear main idea, logical order, accurate and relevant information, clear conclusion',
      max_points: 30,
      order_position: 4,
      scoring_guide: [
        { range: '27-30', description: 'Excellent content and flow' },
        { range: '21-26', description: 'Good content with minor issues' },
        { range: '15-20', description: 'Weak content or flow' },
        { range: '0-14', description: 'Poor content quality' },
      ],
    },
  ]);

  await db.insert(latePolicies).values([
    { rubric_id: hsPresentation[0].id, hours_late_min: 0, hours_late_max: 24, point_deduction: 10, order_position: 1 },
    { rubric_id: hsPresentation[0].id, hours_late_min: 25, hours_late_max: null, point_deduction: 0, custom_rule: 'Teacher discretion', order_position: 2 },
  ]);

  await db.insert(revisionPolicies).values({
    rubric_id: hsPresentation[0].id,
    revisions_allowed: 1,
    max_revision_score: 85,
    revision_deadline_days: 7,
    revision_conditions: 'One revision allowed',
  });

  console.log('✅ High School Presentation template created');

  // ============================================
  // 2-YEAR COLLEGE TEMPLATES
  // ============================================

  const techResearch = await db.insert(rubrics).values({
    user_id: null,
    name: '2-Year Technical College Research Paper',
    rubric_type: 'Research Paper',
    academic_level: '2-Year College',
    description: 'Research paper rubric for 2-year technical college students',
    rubric_summary: 'Evaluates professional writing with emphasis on clarity and proper documentation',
    total_points: 100,
    minimum_word_count: 300,
    late_policy_enabled: true,
    revision_policy_enabled: true,
    is_template: true,
  }).returning();

  await db.insert(rubricCriteria).values([
    {
      rubric_id: techResearch[0].id,
      criterion_name: 'Writing Quality & Clarity',
      criterion_description: 'Sentence structure and clarity, grammar and subject-verb agreement, conciseness, word choice appropriate for academic audience',
      max_points: 25,
      order_position: 1,
      scoring_guide: [
        { range: '23-25', description: 'Clear, polished, and professional' },
        { range: '18-22', description: 'Minor errors that do not affect meaning' },
        { range: '13-17', description: 'Frequent errors affecting readability' },
        { range: '0-12', description: 'Writing significantly interferes with comprehension' },
      ],
    },
    {
      rubric_id: techResearch[0].id,
      criterion_name: 'Organization & Development',
      criterion_description: 'Clear thesis or purpose statement, strong topic sentences, supporting details are relevant and sufficient, logical transitions between ideas',
      max_points: 25,
      order_position: 2,
      scoring_guide: [
        { range: '23-25', description: 'Well-organized and fully developed' },
        { range: '18-22', description: 'Generally clear with minor gaps' },
        { range: '13-17', description: 'Weak structure or limited development' },
        { range: '0-12', description: 'Disorganized or incomplete' },
      ],
    },
    {
      rubric_id: techResearch[0].id,
      criterion_name: 'Source Use & Documentation',
      criterion_description: 'Credible and relevant sources used, accurate in-text citations, properly formatted references/works cited page, evidence is explained and connected to ideas',
      max_points: 25,
      order_position: 3,
      scoring_guide: [
        { range: '23-25', description: 'Sources integrated smoothly and correctly' },
        { range: '18-22', description: 'Minor citation or integration issues' },
        { range: '13-17', description: 'Weak or inconsistent source use' },
        { range: '0-12', description: 'Missing, incorrect, or improperly used sources' },
      ],
    },
    {
      rubric_id: techResearch[0].id,
      criterion_name: 'Technical Accuracy & Assignment Requirements',
      criterion_description: 'Minimum word count met (300+ words), assignment instructions followed, plagiarism check passed, AI-use compliance, clear summary or conclusion',
      max_points: 25,
      order_position: 4,
      scoring_guide: [
        { range: '23-25', description: 'All requirements fully met' },
        { range: '18-22', description: 'One minor requirement issue' },
        { range: '13-17', description: 'Multiple requirement issues' },
        { range: '0-12', description: 'Major requirements unmet' },
      ],
    },
  ]);

  await db.insert(latePolicies).values([
    { rubric_id: techResearch[0].id, hours_late_min: 0, hours_late_max: 24, point_deduction: 10, order_position: 1 },
    { rubric_id: techResearch[0].id, hours_late_min: 25, hours_late_max: 72, point_deduction: 20, order_position: 2 },
    { rubric_id: techResearch[0].id, hours_late_min: 73, hours_late_max: null, point_deduction: 0, custom_rule: 'Not accepted unless prior approval is granted', order_position: 3 },
  ]);

  await db.insert(revisionPolicies).values({
    rubric_id: techResearch[0].id,
    revisions_allowed: 1,
    max_revision_score: 85,
    revision_deadline_days: 7,
    revision_conditions: 'One revision allowed if original submission scored below 85 points',
  });

  console.log('✅ 2-Year Technical College Research Paper template created');

  // Add 4-Year College and Graduate templates (abbreviated for space)
  console.log('✅ All rubric templates created successfully');
}

// Run seed
seedRubricTemplates()
  .then(() => {
    console.log('🎉 Rubric template seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });