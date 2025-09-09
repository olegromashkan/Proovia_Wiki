import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

process.env.DB_FILE = path.join(process.cwd(), 'var', 'test.db');

import { getDb } from '../src/lib/sqlite';
import { saveArticle, getArticle, updateArticle, searchArticles } from '../src/lib/articlesDb';

before(() => {
  const f = process.env.DB_FILE!;
  if (fs.existsSync(f)) fs.rmSync(f);
  getDb();
});

after(() => {
  const f = process.env.DB_FILE!;
  if (fs.existsSync(f)) fs.rmSync(f);
});

test('create, get, update, search article', () => {
  saveArticle({ slug: 't1', title: 'Hello World', description: 'Desc', contentHtml: '<p>Body</p>', status: 'published' });
  const a = getArticle('t1');
  assert.ok(a);
  assert.equal(a!.title, 'Hello World');
  updateArticle('t1', { slug: 't1', title: 'Hello Again', description: 'Desc', contentHtml: '<p>Body</p>', status: 'published' });
  const b = getArticle('t1');
  assert.equal(b!.title, 'Hello Again');
  const results = searchArticles('Hello');
  assert.ok(results.some(r => r.slug === 't1'));
});

