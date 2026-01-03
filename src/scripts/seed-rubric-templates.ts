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
      rubricType: 'essay',
      academicLevel: 'middle_school',
      totalPoints: 100,
      isTemplate: true,
      criteria: [
        {
          criterionName: 'Thesis Statement',
          criterionDescription: 'Clear and focused main argument',
          maxPoints: 20,
          orderPosition: 0,
          scoringGuide: [
            { range: '18-20', description: 'Exceptional thesis' },
            { range: '15-17', description: 'Strong thesis' },
            { range: '12-14', description: 'Adequate thesis' },
            { range: '0-11', description: 'Weak or missing thesis' },
          ],
        },
        {
          criterionName: 'Evidence & Sources',
          criterionDescription: 'Use of credible sources and evidence',
          maxPoints: 30,
          orderPosition: 1,
          scoringGuide: [
            { range: '27-30', description: 'Excellent use of sources' },
            { range: '24-26', description: 'Good use of sources' },
            { range: '18-23', description: 'Adequate sources' },
            { range: '0-17', description: 'Insufficient sources' },
          ],
        },
        {
          criterionName: 'Organization',
          criterionDescription: 'Logical flow and structure',
          maxPoints: 25,
          orderPosition: 2,
          scoringGuide: [
            { range: '23-25', description: 'Excellent organization' },
            { range: '20-22', description: 'Good organization' },
            { range: '15-19', description: 'Adequate organization' },
            { range: '0-14', description: 'Poor organization' },
          ],
        },
        {
          criterionName: 'Writing Quality',
          criterionDescription: 'Grammar, spelling, and clarity',
          maxPoints: 25,
          orderPosition: 3,
          scoringGuide: [
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
      rubricType: 'essay',
      academicLevel: 'middle_school',
      totalPoints: 100,
      isTemplate: true,
      criteria: [
        {
          criterionName: 'Content',
          criterionDescription: 'Ideas and information presented',
          maxPoints: 40,
          orderPosition: 0,
          scoringGuide: [
            { range: '36-40', description: 'Excellent content' },
            { range: '32-35', description: 'Good content' },
            { range: '24-31', description: 'Adequate content' },
            { range: '0-23', description: 'Weak content' },
          ],
        },
        {
          criterionName: 'Organization',
          criterionDescription: 'Structure and flow',
          maxPoints: 30,
          orderPosition: 1,
          scoringGuide: [
            { range: '27-30', description: 'Excellent organization' },
            { range: '24-26', description: 'Good organization' },
            { range: '18-23', description: 'Adequate organization' },
            { range: '0-17', description: 'Poor organization' },
          ],
        },
        {
          criterionName: 'Grammar & Mechanics',
          criterionDescription: 'Spelling, punctuation, grammar',
          maxPoints: 30,
          orderPosition: 2,
          scoringGuide: [
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
      rubricType: 'essay',
      academicLevel: 'high_school',
      totalPoints: 100,
      isTemplate: true,
      criteria: [
        {
          criterionName: 'Thesis & Argument',
          criterionDescription: 'Clear, arguable thesis with strong reasoning',
          maxPoints: 25,
          orderPosition: 0,
          scoringGuide: [
            { range: '23-25', description: 'Exceptional argument' },
            { range: '20-22', description: 'Strong argument' },
            { range: '15-19', description: 'Adequate argument' },
            { range: '0-14', description: 'Weak argument' },
          ],
        },
        {
          criterionName: 'Research & Evidence',
          criterionDescription: 'Quality and integration of sources',
          maxPoints: 30,
          orderPosition: 1,
          scoringGuide: [
            { range: '27-30', description: 'Excellent research' },
            { range: '24-26', description: 'Good research' },
            { range: '18-23', description: 'Adequate research' },
            { range: '0-17', description: 'Insufficient research' },
          ],
        },
        {
          criterionName: 'Analysis',
          criterionDescription: 'Critical thinking and interpretation',
          maxPoints: 25,
          orderPosition: 2,
          scoringGuide: [
            { range: '23-25', description: 'Insightful analysis' },
            { range: '20-22', description: 'Good analysis' },
            { range: '15-19', description: 'Basic analysis' },
            { range: '0-14', description: 'Weak analysis' },
          ],
        },
        {
          criterionName: 'Writing Quality',
          criterionDescription: 'Style, grammar, and clarity',
          maxPoints: 20,
          orderPosition: 3,
          scoringGuide: [
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
      rubricType: 'presentation',
      academicLevel: 'high_school',
      totalPoints: 100,
      isTemplate: true,
      criteria: [
        {
          criterionName: 'Content Knowledge',
          criterionDescription: 'Understanding and accuracy of information',
          maxPoints: 30,
          orderPosition: 0,
          scoringGuide: [
            { range: '27-30', description: 'Expert knowledge' },
            { range: '24-26', description: 'Strong knowledge' },
            { range: '18-23', description: 'Adequate knowledge' },
            { range: '0-17', description: 'Limited knowledge' },
          ],
        },
        {
          criterionName: 'Delivery',
          criterionDescription: 'Voice, pace, eye contact, body language',
          maxPoints: 30,
          orderPosition: 1,
          scoringGuide: [
            { range: '27-30', description: 'Excellent delivery' },
            { range: '24-26', description: 'Good delivery' },
            { range: '18-23', description: 'Adequate delivery' },
            { range: '0-17', description: 'Poor delivery' },
          ],
        },
        {
          criterionName: 'Visual Aids',
          criterionDescription: 'Quality and effectiveness of slides/materials',
          maxPoints: 20,
          orderPosition: 2,
          scoringGuide: [
            { range: '18-20', description: 'Excellent visuals' },
            { range: '16-17', description: 'Good visuals' },
            { range: '12-15', description: 'Adequate visuals' },
            { range: '0-11', description: 'Poor visuals' },
          ],
        },
        {
          criterionName: 'Organization',
          criterionDescription: 'Structure and flow of presentation',
          maxPoints: 20,
          orderPosition: 3,
          scoringGuide: [
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
      rubricType: 'essay',
      academicLevel: 'tech_college',
      totalPoints: 100,
      isTemplate: true,
      criteria: [
        {
          criterionName: 'Technical Content',
          criterionDescription: 'Accuracy and depth of technical information',
          maxPoints: 35,
          orderPosition: 0,
          scoringGuide: [
            { range: '32-35', description: 'Excellent technical content' },
            { range: '28-31', description: 'Good technical content' },
            { range: '21-27', description: 'Adequate technical content' },
            { range: '0-20', description: 'Insufficient technical content' },
          ],
        },
        {
          criterionName: 'Research & Sources',
          criterionDescription: 'Use of credible technical sources',
          maxPoints: 30,
          orderPosition: 1,
          scoringGuide: [
            { range: '27-30', description: 'Excellent sources' },
            { range: '24-26', description: 'Good sources' },
            { range: '18-23', description: 'Adequate sources' },
            { range: '0-17', description: 'Insufficient sources' },
          ],
        },
        {
          criterionName: 'Professional Writing',
          criterionDescription: 'Technical writing style and clarity',
          maxPoints: 35,
          orderPosition: 2,
          scoringGuide: [
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
          ...criterion,
          rubricId: createdRubric.id,
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