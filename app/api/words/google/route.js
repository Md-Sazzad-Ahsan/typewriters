import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

async function loadWords() {
  const filePath = path.resolve(process.cwd(), 'data/google10k.txt');
  const data = await readFile(filePath, 'utf-8');
  return data.split('\n').map(w => w.trim()).filter(Boolean);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      regex,
      startsWith,
      minLength = 1,
      maxLength = Infinity,
      count = 10,
      random = false
    } = body;

    const allWords = await loadWords();

    let filtered = allWords.filter(word => {
      if (word.length < minLength || word.length > maxLength) return false;
      if (startsWith && !word.startsWith(startsWith.toLowerCase())) return false;
      if (regex && !new RegExp(regex).test(word)) return false;
      return true;
    });

    if (filtered.length === 0) {
  return NextResponse.json({ words: [] });
}


    let result = random
      ? Array.from({ length: count }, () => filtered[Math.floor(Math.random() * filtered.length)])
      : filtered.slice(0, count);

    return NextResponse.json({ words: result });
  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
