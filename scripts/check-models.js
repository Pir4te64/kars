const fs = require('fs');
const env = fs.readFileSync('/Users/victormoreira/Documents/kars/.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function main() {
  const { count } = await supabase.from('models').select('*', { count: 'exact', head: true });
  console.log('Total modelos en Supabase:', count);

  // Ver marcas
  const { data: brands } = await supabase.from('brands').select('id, name').order('name');
  console.log('Total marcas:', brands?.length);
  console.log(brands?.map(b => b.name).join(', '));
}
main();
