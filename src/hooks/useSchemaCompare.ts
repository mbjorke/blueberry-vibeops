import { useState, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TableColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export interface RLSPolicy {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string | null;
  with_check: string | null;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  policies: RLSPolicy[];
}

export interface SchemaDiff {
  newTables: string[];
  removedTables: string[];
  modifiedTables: {
    name: string;
    newColumns: TableColumn[];
    removedColumns: string[];
    modifiedColumns: TableColumn[];
  }[];
  newPolicies: RLSPolicy[];
  removedPolicies: RLSPolicy[];
}

export interface SchemaSnapshot {
  tables: TableInfo[];
  fetchedAt: Date;
}

interface UseSchemaCompareReturn {
  sourceSchema: SchemaSnapshot | null;
  targetSchema: SchemaSnapshot | null;
  diff: SchemaDiff | null;
  loading: boolean;
  error: string | null;
  fetchSourceSchema: (url: string, anonKey: string) => Promise<void>;
  fetchTargetSchema: (url: string, anonKey: string) => Promise<void>;
  compareSchemas: () => void;
  generateMigrationSQL: () => string;
}

async function fetchSchemaFromSupabase(
  supabase: SupabaseClient
): Promise<TableInfo[]> {
  // Fetch tables and columns
  const { data: columnsData, error: columnsError } = await supabase.rpc('get_schema_info');
  
  if (columnsError) {
    // If RPC doesn't exist, try direct query (requires appropriate permissions)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public');
    
    if (fallbackError) {
      throw new Error(`Failed to fetch schema: ${fallbackError.message}`);
    }
    
    // Group columns by table
    const tableMap = new Map<string, TableColumn[]>();
    (fallbackData || []).forEach((col: TableColumn) => {
      if (!tableMap.has(col.table_name)) {
        tableMap.set(col.table_name, []);
      }
      tableMap.get(col.table_name)!.push(col);
    });
    
    return Array.from(tableMap.entries()).map(([name, columns]) => ({
      name,
      columns,
      policies: [],
    }));
  }
  
  // Process RPC result
  const tableMap = new Map<string, TableInfo>();
  (columnsData || []).forEach((col: TableColumn) => {
    if (!tableMap.has(col.table_name)) {
      tableMap.set(col.table_name, {
        name: col.table_name,
        columns: [],
        policies: [],
      });
    }
    tableMap.get(col.table_name)!.columns.push(col);
  });
  
  return Array.from(tableMap.values());
}

function computeSchemaDiff(
  source: SchemaSnapshot,
  target: SchemaSnapshot
): SchemaDiff {
  const sourceTableNames = new Set(source.tables.map(t => t.name));
  const targetTableNames = new Set(target.tables.map(t => t.name));
  
  const newTables = source.tables
    .filter(t => !targetTableNames.has(t.name))
    .map(t => t.name);
  
  const removedTables = target.tables
    .filter(t => !sourceTableNames.has(t.name))
    .map(t => t.name);
  
  const modifiedTables: SchemaDiff['modifiedTables'] = [];
  
  source.tables.forEach(sourceTable => {
    const targetTable = target.tables.find(t => t.name === sourceTable.name);
    if (!targetTable) return; // New table, handled above
    
    const sourceColumnNames = new Set(sourceTable.columns.map(c => c.column_name));
    const targetColumnNames = new Set(targetTable.columns.map(c => c.column_name));
    
    const newColumns = sourceTable.columns.filter(c => !targetColumnNames.has(c.column_name));
    const removedColumns = targetTable.columns
      .filter(c => !sourceColumnNames.has(c.column_name))
      .map(c => c.column_name);
    
    // Check for modified columns (same name, different type/nullable)
    const modifiedColumns = sourceTable.columns.filter(srcCol => {
      const tgtCol = targetTable.columns.find(c => c.column_name === srcCol.column_name);
      if (!tgtCol) return false;
      return (
        srcCol.data_type !== tgtCol.data_type ||
        srcCol.is_nullable !== tgtCol.is_nullable
      );
    });
    
    if (newColumns.length > 0 || removedColumns.length > 0 || modifiedColumns.length > 0) {
      modifiedTables.push({
        name: sourceTable.name,
        newColumns,
        removedColumns,
        modifiedColumns,
      });
    }
  });
  
  // Compare policies (simplified - just check by name)
  const sourcePolicies = source.tables.flatMap(t => t.policies);
  const targetPolicies = target.tables.flatMap(t => t.policies);
  
  const sourcePolicyKeys = new Set(sourcePolicies.map(p => `${p.tablename}.${p.policyname}`));
  const targetPolicyKeys = new Set(targetPolicies.map(p => `${p.tablename}.${p.policyname}`));
  
  const newPolicies = sourcePolicies.filter(
    p => !targetPolicyKeys.has(`${p.tablename}.${p.policyname}`)
  );
  const removedPolicies = targetPolicies.filter(
    p => !sourcePolicyKeys.has(`${p.tablename}.${p.policyname}`)
  );
  
  return {
    newTables,
    removedTables,
    modifiedTables,
    newPolicies,
    removedPolicies,
  };
}

function generateSQL(diff: SchemaDiff, sourceSchema: SchemaSnapshot): string {
  const lines: string[] = [];
  lines.push('-- Migration generated by VibeOps Migration Helper');
  lines.push(`-- Generated at: ${new Date().toISOString()}`);
  lines.push('');
  
  // New tables
  if (diff.newTables.length > 0) {
    lines.push('-- New Tables');
    diff.newTables.forEach(tableName => {
      const table = sourceSchema.tables.find(t => t.name === tableName);
      if (!table) return;
      
      lines.push(`CREATE TABLE IF NOT EXISTS public.${tableName} (`);
      const columnDefs = table.columns.map(col => {
        let def = `  ${col.column_name} ${col.data_type.toUpperCase()}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      lines.push(columnDefs.join(',\n'));
      lines.push(');');
      lines.push('');
    });
  }
  
  // Modified tables - new columns
  diff.modifiedTables.forEach(mod => {
    if (mod.newColumns.length > 0) {
      lines.push(`-- Add columns to ${mod.name}`);
      mod.newColumns.forEach(col => {
        let def = `ALTER TABLE public.${mod.name} ADD COLUMN IF NOT EXISTS ${col.column_name} ${col.data_type.toUpperCase()}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        lines.push(`${def};`);
      });
      lines.push('');
    }
  });
  
  // Removed columns (commented out for safety)
  diff.modifiedTables.forEach(mod => {
    if (mod.removedColumns.length > 0) {
      lines.push(`-- CAUTION: Columns removed from ${mod.name} (uncomment if intended)`);
      mod.removedColumns.forEach(colName => {
        lines.push(`-- ALTER TABLE public.${mod.name} DROP COLUMN IF EXISTS ${colName};`);
      });
      lines.push('');
    }
  });
  
  // Removed tables (commented out for safety)
  if (diff.removedTables.length > 0) {
    lines.push('-- CAUTION: Tables removed (uncomment if intended)');
    diff.removedTables.forEach(tableName => {
      lines.push(`-- DROP TABLE IF EXISTS public.${tableName};`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

export function useSchemaCompare(): UseSchemaCompareReturn {
  const [sourceSchema, setSourceSchema] = useState<SchemaSnapshot | null>(null);
  const [targetSchema, setTargetSchema] = useState<SchemaSnapshot | null>(null);
  const [diff, setDiff] = useState<SchemaDiff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSourceSchema = useCallback(async (url: string, anonKey: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(url, anonKey);
      const tables = await fetchSchemaFromSupabase(supabase);
      setSourceSchema({
        tables,
        fetchedAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch source schema';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTargetSchema = useCallback(async (url: string, anonKey: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(url, anonKey);
      const tables = await fetchSchemaFromSupabase(supabase);
      setTargetSchema({
        tables,
        fetchedAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch target schema';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const compareSchemas = useCallback(() => {
    if (!sourceSchema || !targetSchema) {
      setError('Both source and target schemas must be loaded');
      return;
    }
    
    const computed = computeSchemaDiff(sourceSchema, targetSchema);
    setDiff(computed);
  }, [sourceSchema, targetSchema]);

  const generateMigrationSQL = useCallback(() => {
    if (!diff || !sourceSchema) {
      return '-- No differences detected or schemas not loaded';
    }
    return generateSQL(diff, sourceSchema);
  }, [diff, sourceSchema]);

  return {
    sourceSchema,
    targetSchema,
    diff,
    loading,
    error,
    fetchSourceSchema,
    fetchTargetSchema,
    compareSchemas,
    generateMigrationSQL,
  };
}
