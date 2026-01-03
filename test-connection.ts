import postgres from 'postgres';

const connectionString = process.env.GRADER_DATABASE_URL;

console.log('Testing connection...');
console.log('String:', connectionString?.substring(0, 50));

const sql = postgres(connectionString!);

async function test() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM subscription_plans`;
    console.log('Connected! Plans:', result[0].count);
    await sql.end();
  } catch (error: any) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
}

test();