import { describe, it, expect } from 'vitest';
import {
  computeSchemaDiff,
  generateMigrationSQL,
  schemasAreEqual,
  getDiffChangeCount,
  type SchemaSnapshot,
  type TableInfo,
} from './schemaCompare';

// Helper to create a mock schema
function createSchema(tables: Partial<TableInfo>[]): SchemaSnapshot {
  return {
    tables: tables.map(t => ({
      name: t.name || 'test_table',
      columns: t.columns || [],
      policies: t.policies || [],
    })),
    fetchedAt: new Date(),
  };
}

describe('computeSchemaDiff', () => {
  it('should detect new tables', () => {
    const source = createSchema([
      { name: 'users', columns: [] },
      { name: 'posts', columns: [] },
    ]);
    const target = createSchema([
      { name: 'users', columns: [] },
    ]);

    const diff = computeSchemaDiff(source, target);
    
    expect(diff.newTables).toEqual(['posts']);
    expect(diff.removedTables).toEqual([]);
  });

  it('should detect removed tables', () => {
    const source = createSchema([
      { name: 'users', columns: [] },
    ]);
    const target = createSchema([
      { name: 'users', columns: [] },
      { name: 'posts', columns: [] },
    ]);

    const diff = computeSchemaDiff(source, target);
    
    expect(diff.newTables).toEqual([]);
    expect(diff.removedTables).toEqual(['posts']);
  });

  it('should detect new columns', () => {
    const source = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
        { table_name: 'users', column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null },
        { table_name: 'users', column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null },
      ],
    }]);
    const target = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
        { table_name: 'users', column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null },
      ],
    }]);

    const diff = computeSchemaDiff(source, target);
    
    expect(diff.modifiedTables).toHaveLength(1);
    expect(diff.modifiedTables[0].name).toBe('users');
    expect(diff.modifiedTables[0].newColumns).toHaveLength(1);
    expect(diff.modifiedTables[0].newColumns[0].column_name).toBe('name');
  });

  it('should detect removed columns', () => {
    const source = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      ],
    }]);
    const target = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
        { table_name: 'users', column_name: 'deleted_col', data_type: 'text', is_nullable: 'YES', column_default: null },
      ],
    }]);

    const diff = computeSchemaDiff(source, target);
    
    expect(diff.modifiedTables).toHaveLength(1);
    expect(diff.modifiedTables[0].removedColumns).toContain('deleted_col');
  });

  it('should detect modified columns (type change)', () => {
    const source = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'age', data_type: 'integer', is_nullable: 'YES', column_default: null },
      ],
    }]);
    const target = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'age', data_type: 'text', is_nullable: 'YES', column_default: null },
      ],
    }]);

    const diff = computeSchemaDiff(source, target);
    
    expect(diff.modifiedTables).toHaveLength(1);
    expect(diff.modifiedTables[0].modifiedColumns).toHaveLength(1);
    expect(diff.modifiedTables[0].modifiedColumns[0].column_name).toBe('age');
  });

  it('should detect modified columns (nullable change)', () => {
    const source = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null },
      ],
    }]);
    const target = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'email', data_type: 'text', is_nullable: 'YES', column_default: null },
      ],
    }]);

    const diff = computeSchemaDiff(source, target);
    
    expect(diff.modifiedTables).toHaveLength(1);
    expect(diff.modifiedTables[0].modifiedColumns).toHaveLength(1);
  });

  it('should return empty diff for identical schemas', () => {
    const schema = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      ],
    }]);

    const diff = computeSchemaDiff(schema, schema);
    
    expect(diff.newTables).toEqual([]);
    expect(diff.removedTables).toEqual([]);
    expect(diff.modifiedTables).toEqual([]);
    expect(diff.newPolicies).toEqual([]);
    expect(diff.removedPolicies).toEqual([]);
  });
});

describe('generateMigrationSQL', () => {
  it('should generate CREATE TABLE for new tables', () => {
    const source = createSchema([{
      name: 'posts',
      columns: [
        { table_name: 'posts', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
        { table_name: 'posts', column_name: 'title', data_type: 'text', is_nullable: 'NO', column_default: null },
      ],
    }]);
    const target = createSchema([]);
    const diff = computeSchemaDiff(source, target);
    
    const sql = generateMigrationSQL(diff, source);
    
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.posts');
    expect(sql).toContain('id UUID NOT NULL DEFAULT gen_random_uuid()');
    expect(sql).toContain('title TEXT NOT NULL');
  });

  it('should generate ALTER TABLE for new columns', () => {
    const source = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
        { table_name: 'users', column_name: 'bio', data_type: 'text', is_nullable: 'YES', column_default: null },
      ],
    }]);
    const target = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      ],
    }]);
    const diff = computeSchemaDiff(source, target);
    
    const sql = generateMigrationSQL(diff, source);
    
    expect(sql).toContain('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT');
  });

  it('should comment out DROP statements for safety', () => {
    const source = createSchema([{ name: 'users', columns: [] }]);
    const target = createSchema([
      { name: 'users', columns: [] },
      { name: 'old_table', columns: [] },
    ]);
    const diff = computeSchemaDiff(source, target);
    
    const sql = generateMigrationSQL(diff, source);
    
    expect(sql).toContain('-- DROP TABLE IF EXISTS public.old_table');
    expect(sql).toContain('CAUTION');
  });

  it('should include header comment', () => {
    const diff = computeSchemaDiff(createSchema([]), createSchema([]));
    const sql = generateMigrationSQL(diff, createSchema([]));
    
    expect(sql).toContain('Migration generated by VibeOps');
    expect(sql).toContain('Generated at:');
  });
});

describe('schemasAreEqual', () => {
  it('should return true for identical schemas', () => {
    const schema = createSchema([{
      name: 'users',
      columns: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      ],
    }]);
    
    expect(schemasAreEqual(schema, schema)).toBe(true);
  });

  it('should return false for different schemas', () => {
    const schema1 = createSchema([{ name: 'users', columns: [] }]);
    const schema2 = createSchema([{ name: 'posts', columns: [] }]);
    
    expect(schemasAreEqual(schema1, schema2)).toBe(false);
  });
});

describe('getDiffChangeCount', () => {
  it('should return 0 for empty diff', () => {
    const diff = computeSchemaDiff(createSchema([]), createSchema([]));
    expect(getDiffChangeCount(diff)).toBe(0);
  });

  it('should count all types of changes', () => {
    const source = createSchema([
      { name: 'new_table', columns: [] },
      { 
        name: 'modified_table', 
        columns: [
          { table_name: 'modified_table', column_name: 'new_col', data_type: 'text', is_nullable: 'YES', column_default: null },
        ] 
      },
    ]);
    const target = createSchema([
      { name: 'removed_table', columns: [] },
      { name: 'modified_table', columns: [] },
    ]);
    
    const diff = computeSchemaDiff(source, target);
    
    // 1 new table + 1 removed table + 1 modified table = 3
    expect(getDiffChangeCount(diff)).toBe(3);
  });
});
