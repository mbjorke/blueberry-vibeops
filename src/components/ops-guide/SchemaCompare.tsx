import { 
  Table, 
  Plus, 
  Minus, 
  Edit3, 
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SchemaSnapshot, SchemaDiff, TableColumn } from '@/hooks/useSchemaCompare';

interface SchemaCompareProps {
  sourceSchema: SchemaSnapshot;
  targetSchema: SchemaSnapshot;
  diff: SchemaDiff | null;
}

export function SchemaCompare({ sourceSchema, targetSchema, diff }: SchemaCompareProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  // Combine all tables from both schemas
  const allTables = new Map<string, { 
    source: typeof sourceSchema.tables[0] | null; 
    target: typeof targetSchema.tables[0] | null;
    status: 'new' | 'removed' | 'modified' | 'unchanged';
  }>();

  sourceSchema.tables.forEach(table => {
    allTables.set(table.name, { source: table, target: null, status: 'new' });
  });

  targetSchema.tables.forEach(table => {
    const existing = allTables.get(table.name);
    if (existing) {
      existing.target = table;
      existing.status = 'unchanged';
    } else {
      allTables.set(table.name, { source: null, target: table, status: 'removed' });
    }
  });

  // Mark modified tables
  if (diff) {
    diff.newTables.forEach(name => {
      const entry = allTables.get(name);
      if (entry) entry.status = 'new';
    });
    diff.removedTables.forEach(name => {
      const entry = allTables.get(name);
      if (entry) entry.status = 'removed';
    });
    diff.modifiedTables.forEach(mod => {
      const entry = allTables.get(mod.name);
      if (entry) entry.status = 'modified';
    });
  }

  const sortedTables = Array.from(allTables.entries()).sort((a, b) => {
    const statusOrder = { new: 0, modified: 1, removed: 2, unchanged: 3 };
    const orderDiff = statusOrder[a[1].status] - statusOrder[b[1].status];
    if (orderDiff !== 0) return orderDiff;
    return a[0].localeCompare(b[0]);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-success text-success-foreground">New</Badge>;
      case 'removed':
        return <Badge variant="destructive">Removed</Badge>;
      case 'modified':
        return <Badge className="bg-warning text-warning-foreground">Modified</Badge>;
      default:
        return <Badge variant="outline">Unchanged</Badge>;
    }
  };

  const getModifications = (tableName: string) => {
    if (!diff) return null;
    return diff.modifiedTables.find(m => m.name === tableName);
  };

  const renderColumnDiff = (
    sourceColumns: TableColumn[] | undefined, 
    targetColumns: TableColumn[] | undefined,
    mods: ReturnType<typeof getModifications>
  ) => {
    const allColumns = new Map<string, { 
      source: TableColumn | null; 
      target: TableColumn | null;
      status: 'new' | 'removed' | 'modified' | 'unchanged';
    }>();

    sourceColumns?.forEach(col => {
      allColumns.set(col.column_name, { source: col, target: null, status: 'new' });
    });

    targetColumns?.forEach(col => {
      const existing = allColumns.get(col.column_name);
      if (existing) {
        existing.target = col;
        existing.status = 'unchanged';
      } else {
        allColumns.set(col.column_name, { source: null, target: col, status: 'removed' });
      }
    });

    // Apply modifications from diff
    if (mods) {
      mods.newColumns.forEach(col => {
        const entry = allColumns.get(col.column_name);
        if (entry) entry.status = 'new';
      });
      mods.removedColumns.forEach(colName => {
        const entry = allColumns.get(colName);
        if (entry) entry.status = 'removed';
      });
      mods.modifiedColumns.forEach(col => {
        const entry = allColumns.get(col.column_name);
        if (entry) entry.status = 'modified';
      });
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">Column</th>
              <th className="text-left p-2 font-medium">Type</th>
              <th className="text-left p-2 font-medium">Nullable</th>
              <th className="text-left p-2 font-medium">Default</th>
              <th className="text-left p-2 font-medium w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(allColumns.entries()).map(([colName, { source, target, status }]) => {
              const col = source || target;
              if (!col) return null;
              
              return (
                <tr 
                  key={colName} 
                  className={`
                    border-t
                    ${status === 'new' ? 'bg-success/10' : ''}
                    ${status === 'removed' ? 'bg-destructive/10' : ''}
                    ${status === 'modified' ? 'bg-warning/10' : ''}
                  `}
                >
                  <td className="p-2 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      {status === 'new' && <Plus className="h-3 w-3 text-success" />}
                      {status === 'removed' && <Minus className="h-3 w-3 text-destructive" />}
                      {status === 'modified' && <Edit3 className="h-3 w-3 text-warning" />}
                      {col.column_name}
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">{col.data_type}</td>
                  <td className="p-2">{col.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                  <td className="p-2 font-mono text-xs truncate max-w-32" title={col.column_default || ''}>
                    {col.column_default || '-'}
                  </td>
                  <td className="p-2">
                    {status === 'new' && <Badge variant="outline" className="text-success border-success text-xs">New</Badge>}
                    {status === 'removed' && <Badge variant="outline" className="text-destructive border-destructive text-xs">Removed</Badge>}
                    {status === 'modified' && <Badge variant="outline" className="text-warning border-warning text-xs">Modified</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* No changes state */}
      {diff && 
       diff.newTables.length === 0 && 
       diff.removedTables.length === 0 && 
       diff.modifiedTables.length === 0 && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Schemas are in sync!</h3>
            <p className="text-muted-foreground">
              No differences detected between source and target databases.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tables List */}
      {sortedTables.map(([tableName, { source, target, status }]) => {
        const isExpanded = expandedTables.has(tableName);
        const mods = getModifications(tableName);
        
        // Skip unchanged tables in compact view
        if (status === 'unchanged' && !isExpanded) {
          return null;
        }

        return (
          <Collapsible key={tableName} open={isExpanded}>
            <Card className={`
              ${status === 'new' ? 'border-success/50' : ''}
              ${status === 'removed' ? 'border-destructive/50' : ''}
              ${status === 'modified' ? 'border-warning/50' : ''}
            `}>
              <CollapsibleTrigger 
                className="w-full"
                onClick={() => toggleTable(tableName)}
              >
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Table className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base font-mono">{tableName}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {(source?.columns.length || target?.columns.length || 0)} columns
                      </span>
                      {getStatusBadge(status)}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {renderColumnDiff(source?.columns, target?.columns, mods)}
                  
                  {/* Show modifications summary */}
                  {mods && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                      <h4 className="font-medium mb-2">Changes:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        {mods.newColumns.length > 0 && (
                          <li className="flex items-center gap-2">
                            <Plus className="h-3 w-3 text-success" />
                            {mods.newColumns.length} new column(s)
                          </li>
                        )}
                        {mods.removedColumns.length > 0 && (
                          <li className="flex items-center gap-2">
                            <Minus className="h-3 w-3 text-destructive" />
                            {mods.removedColumns.length} removed column(s)
                          </li>
                        )}
                        {mods.modifiedColumns.length > 0 && (
                          <li className="flex items-center gap-2">
                            <Edit3 className="h-3 w-3 text-warning" />
                            {mods.modifiedColumns.length} modified column(s)
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* Show count of unchanged tables */}
      {diff && sortedTables.filter(([, { status }]) => status === 'unchanged').length > 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          {sortedTables.filter(([, { status }]) => status === 'unchanged').length} unchanged tables not shown
        </div>
      )}
    </div>
  );
}
