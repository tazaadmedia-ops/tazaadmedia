import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Reading wordlist from /tmp/hesudhar_wordlist.json...');
  const rawData = fs.readFileSync('/tmp/hesudhar_wordlist.json', 'utf8');
  const wordlist = JSON.parse(rawData);

  console.log(`Found ${wordlist.length} words. Starting seed...`);

  // Batch inserts to stay within limits
  const batchSize = 500;
  for (let i = 0; i < wordlist.length; i += batchSize) {
    const batch = wordlist.slice(i, i + batchSize).map((item: any) => ({
      word: item.word,
      correct: item.correct
    }));

    const { error } = await supabase
      .from('hesudhar_dictionary')
      .upsert(batch, { onConflict: 'word' });

    if (error) {
      console.error(`Error inserting batch ${i / batchSize}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(wordlist.length / batchSize)}`);
    }
  }

  console.log('Seed completed successfully.');
}

seed().catch(console.error);
