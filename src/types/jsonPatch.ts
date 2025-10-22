import * as jsonpatch from 'fast-json-patch';

export type JsonPatchOperationType = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test' | 'append';

export interface JsonPatchOperation {
  op: JsonPatchOperationType;
  path: string;
  value?: any;
  from?: string;
}

export interface JsonPatchHistory {
  operation: jsonpatch.Operation;
  result: any;
  timestamp: number;
  id?: string;
}

export interface JsonPatchError {
  message: string;
  operation?: jsonpatch.Operation;
  code?: string;
  details?: any;
}

export interface JsonPatchValidationResult {
  isValid: boolean;
  error?: JsonPatchError;
}

export interface JsonPatchStats {
  totalOperations: number;
  operationsByType: Record<string, number>;
  lastModified: number;
  dataSize: number;
}

export interface JsonPatchConfig {
  maxHistorySize: number;
  enableValidation: boolean;
  enableStats: boolean;
  autoSave: boolean;
  debounceMs: number;
}

export interface JsonPatchSnapshot {
  data: any;
  operations: jsonpatch.Operation[];
  timestamp: number;
  version: string;
}
