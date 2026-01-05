import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { rubrics, rubricCriteria } from '../../shared/schema';

const DATABASE_URL = process.env.GRADER_DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('❌ GRADER_DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function seedRubricTemplates() {
  console.log('🌱 Seeding rubric templates...\n');

  const templates = [
    {
      name: 'Middle School Research Writing',
      description: 'Research paper rubric for middle school students',
      rubric_type: 'essay',
      academic_level: 'middle_school',
      total_points: 100,
      is_template: true,
      criteria: [
        {
          criterion_name: 'Thesis Statement',
          criterion_description: 'Clear and focused main argument',
          max_points: 20,
          order_position: 0,
          scoring_guide: [
            { range: '18-20', description: 'Exceptional thesis' },
            { range: '15-17', description: 'Strong thesis' },
            { range: '12-14', description: 'Adequate thesis' },
            { range: '0-11', description: 'Weak or missing thesis' },
          ],
        },
        {
          criterion_name: 'Evidence & Sources',
          criterion_description: 'Use of credible sources and evidence',
          max_points: 30,
          order_position: 1,
          scoring_guide: [
            { range: '27-30', description: 'Excellent use of sources' },
            { range: '24-26', description: 'Good use of sources' },
            { range: '18-23', description: 'Adequate sources' },
            { range: '0-17', description: 'Insufficient sources' },
          ],
        },
        {
          criterion_name: 'Organization',
          criterion_description: 'Logical flow and structure',
          max_points: 25,
          order_position: 2,
          scoring_guide: [
            { range: '23-25', description: 'Excellent organization' },
            { range: '20-22', description: 'Good organization' },
            { range: '15-19', description: 'Adequate organization' },
            { range: '0-14', description: 'Poor organization' },
          ],
        },
        {
          criterion_name: 'Writing Quality',
          criterion_description: 'Grammar, spelling, and clarity',
          max_points: 25,
          order_position: 3,
          scoring_guide: [
            { range: '23-25', description: 'Excellent writing' },
            { range: '20-22', description: 'Good writing' },
            { range: '15-19', description: 'Adequate writing' },
            { range: '0-14', description: 'Poor writing' },
          ],
        },
      ],
    },
    {
      name: 'Middle School General Writing',
      description: 'General writing rubric for middle school',
      rubric_type: 'essay',
      academic_level: 'middle_school',
      total_points: 100,
      is_template: true,
      criteria: [
        {
          criterion_name: 'Content',
          criterion_description: 'Ideas and information presented',
          max_points: 40,
          order_position: 0,
          scoring_guide: [
            { range: '36-40', description: 'Excellent content' },
            { range: '32-35', description: 'Good content' },
            { range: '24-31', description: 'Adequate content' },
            { range: '0-23', description: 'Weak content' },
          ],
        },
        {
          criterion_name: 'Organization',
          criterion_description: 'Structure and flow',
          max_points: 30,
          order_position: 1,
          scoring_guide: [
            { range: '27-30', description: 'Excellent organization' },
            { range: '24-26', description: 'Good organization' },
            { range: '18-23', description: 'Adequate organization' },
            { range: '0-17', description: 'Poor organization' },
          ],
        },
        {
          criterion_name: 'Grammar & Mechanics',
          criterion_description: 'Spelling, punctuation, grammar',
          max_points: 30,
          order_position: 2,
          scoring_guide: [
            { range: '27-30', description: 'Excellent mechanics' },
            { range: '24-26', description: 'Good mechanics' },
            { range: '18-23', description: 'Adequate mechanics' },
            { range: '0-17', description: 'Poor mechanics' },
          ],
        },
      ],
    },
    {
      name: 'High School Research Paper',
      description: 'Comprehensive research paper rubric',
      rubric_type: 'essay',
      academic_level: 'high_school',
      total_points: 100,
      is_template: true,
      criteria: [
        {
          criterion_name: 'Thesis & Argument',
          criterion_description: 'Clear, arguable thesis with strong reasoning',
          max_points: 25,
          order_position: 0,
          scoring_guide: [
            { range: '23-25', description: 'Exceptional argument' },
            { range: '20-22', description: 'Strong argument' },
            { range: '15-19', description: 'Adequate argument' },
            { range: '0-14', description: 'Weak argument' },
          ],
        },
        {
          criterion_name: 'Research & Evidence',
          criterion_description: 'Quality and integration of sources',
          max_points: 30,
          order_position: 1,
          scoring_guide: [
            { range: '27-30', description: 'Excellent research' },
            { range: '24-26', description: 'Good research' },
            { range: '18-23', description: 'Adequate research' },
            { range: '0-17', description: 'Insufficient research' },
          ],
        },
        {
          criterion_name: 'Analysis',
          criterion_description: 'Critical thinking and interpretation',
          max_points: 25,
          order_position: 2,
          scoring_guide: [
            { range: '23-25', description: 'Insightful analysis' },
            { range: '20-22', description: 'Good analysis' },
            { range: '15-19', description: 'Basic analysis' },
            { range: '0-14', description: 'Weak analysis' },
          ],
        },
        {
          criterion_name: 'Writing Quality',
          criterion_description: 'Style, grammar, and clarity',
          max_points: 20,
          order_position: 3,
          scoring_guide: [
            { range: '18-20', description: 'Excellent writing' },
            { range: '16-17', description: 'Good writing' },
            { range: '12-15', description: 'Adequate writing' },
            { range: '0-11', description: 'Poor writing' },
          ],
        },
      ],
    },
    {
      name: 'High School Presentation',
      description: 'Oral presentation rubric',
      rubric_type: 'presentation',
      academic_level: 'high_school',
      total_points: 100,
      is_template: true,
      criteria: [
        {
          criterion_name: 'Content Knowledge',
          criterion_description: 'Understanding and accuracy of information',
          max_points: 30,
          order_position: 0,
          scoring_guide: [
            { range: '27-30', description: 'Expert knowledge' },
            { range: '24-26', description: 'Strong knowledge' },
            { range: '18-23', description: 'Adequate knowledge' },
            { range: '0-17', description: 'Limited knowledge' },
          ],
        },
        {
          criterion_name: 'Delivery',
          criterion_description: 'Voice, pace, eye contact, body language',
          max_points: 30,
          order_position: 1,
          scoring_guide: [
            { range: '27-30', description: 'Excellent delivery' },
            { range: '24-26', description: 'Good delivery' },
            { range: '18-23', description: 'Adequate delivery' },
            { range: '0-17', description: 'Poor delivery' },
          ],
        },
        {
          criterion_name: 'Visual Aids',
          criterion_description: 'Quality and effectiveness of slides/materials',
          max_points: 20,
          order_position: 2,
          scoring_guide: [
            { range: '18-20', description: 'Excellent visuals' },
            { range: '16-17', description: 'Good visuals' },
            { range: '12-15', description: 'Adequate visuals' },
            { range: '0-11', description: 'Poor visuals' },
          ],
        },
        {
          criterion_name: 'Organization',
          criterion_description: 'Structure and flow of presentation',
          max_points: 20,
          order_position: 3,
          scoring_guide: [
            { range: '18-20', description: 'Excellent organization' },
            { range: '16-17', description: 'Good organization' },
            { range: '12-15', description: 'Adequate organization' },
            { range: '0-11', description: 'Poor organization' },
          ],
        },
      ],
    },
    {
      name: '2-Year Technical College Research Paper',
      description: 'Research paper rubric for technical college',
      rubric_type: 'essay',
      academic_level: 'tech_college',
      total_points: 100,
      is_template: true,
      criteria: [
        {
          criterion_name: 'Technical Content',
          criterion_description: 'Accuracy and depth of technical information',
          max_points: 35,
          order_position: 0,
          scoring_guide: [
            { range: '32-35', description: 'Excellent technical content' },
            { range: '28-31', description: 'Good technical content' },
            { range: '21-27', description: 'Adequate technical content' },
            { range: '0-20', description: 'Insufficient technical content' },
          ],
        },
        {
          criterion_name: 'Research & Sources',
          criterion_description: 'Use of credible technical sources',
          max_points: 30,
          order_position: 1,
          scoring_guide: [
            { range: '27-30', description: 'Excellent sources' },
            { range: '24-26', description: 'Good sources' },
            { range: '18-23', description: 'Adequate sources' },
            { range: '0-17', description: 'Insufficient sources' },
          ],
        },
        {
          criterion_name: 'Professional Writing',
          criterion_description: 'Technical writing style and clarity',
          max_points: 35,
          order_position: 2,
          scoring_guide: [
            { range: '32-35', description: 'Excellent professional writing' },
            { range: '28-31', description: 'Good professional writing' },
            { range: '21-27', description: 'Adequate writing' },
            { range: '0-20', description: 'Unprofessional writing' },
          ],
        },
      ],
    },
  ];

  try {
    for (const template of templates) {
      const { criteria, ...rubricData } = template;

      const [createdRubric] = await db
        .insert(rubrics)
        .values(rubricData)
        .returning();

      for (const criterion of criteria) {
        await db.insert(rubricCriteria).values({
          rubric_id: createdRubric.id,
          criterion_name: criterion.criterion_name,
          criterion_description: criterion.criterion_description,
          max_points: criterion.max_points,
          order_position: criterion.order_position,
          scoring_guide: criterion.scoring_guide,
        });
      }

      console.log(`✅ ${template.name} template created`);
    }

    console.log('\n✅ All rubric templates created successfully');
    console.log('🎉 Rubric template seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedRubricTemplates();