import { useState, useCallback, useMemo } from 'react';
import * as jsonpatch from 'fast-json-patch';

export interface JsonPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

export interface JsonPatchHistory {
  operation: jsonpatch.Operation;
  result: any;
  timestamp: number;
}

export interface JsonPatchError {
  message: string;
  operation?: jsonpatch.Operation;
  code?: string;
}

export interface UseJsonPatchOptions {
  initialData?: any;
  maxHistorySize?: number;
  enableValidation?: boolean;
  onError?: (error: JsonPatchError) => void;
  onSuccess?: (operation: jsonpatch.Operation, result: any) => void;
}

export interface UseJsonPatchReturn {
  // 状态
  data: any;
  originalData: any;
  operations: jsonpatch.Operation[];
  history: JsonPatchHistory[];
  canUndo: boolean;
  canRedo: boolean;

  // 操作方法
  applyOperation: (operation: JsonPatchOperation) => Promise<boolean>;
  applyPatch: (patch: jsonpatch.Operation[]) => Promise<boolean>;
  undo: () => boolean;
  redo: () => boolean;
  reset: () => void;
  setData: (newData: any) => void;

  // 工具方法
  generatePatch: (from?: any, to?: any) => jsonpatch.Operation[];
  validateOperation: (operation: JsonPatchOperation) => JsonPatchError | null;
  getValueByPath: (path: string) => any;
  pathExists: (path: string) => boolean;

  // 便捷操作
  add: (path: string, value: any) => Promise<boolean>;
  addWithPath: (path: string, value: any) => Promise<boolean>; // 自动创建路径的 add 操作
  remove: (path: string) => Promise<boolean>;
  replace: (path: string, value: any) => Promise<boolean>;
  move: (from: string, to: string) => Promise<boolean>;
  copy: (from: string, to: string) => Promise<boolean>;
  test: (path: string, value: any) => Promise<boolean>;
  append: (path: string, text: string) => Promise<boolean>;
}

const DEFAULT_OPTIONS: Required<UseJsonPatchOptions> = {
  initialData: {},
  maxHistorySize: 50,
  enableValidation: true,
  onError: () => { },
  onSuccess: () => { },
};

export const useJsonPatch = (options: UseJsonPatchOptions = {}): UseJsonPatchReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const [originalData] = useState(() =>
    config.initialData ? JSON.parse(JSON.stringify(config.initialData)) : {}
  );

  const [data, setDataState] = useState(() =>
    config.initialData ? JSON.parse(JSON.stringify(config.initialData)) : {}
  );

  const [operations, setOperations] = useState<jsonpatch.Operation[]>([]);
  const [history, setHistory] = useState<JsonPatchHistory[]>([]);
  const [redoStack, setRedoStack] = useState<JsonPatchHistory[]>([]);

  // 解析 JSON 值
  const parseJsonValue = useCallback((value: any): any => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }, []);

  // 验证路径格式
  const validatePath = useCallback((path: string): boolean => {
    return path.startsWith('/');
  }, []);

  // 确保路径存在（自动创建缺失的父路径）
  const ensurePathExists = useCallback((path: string, currentData: any): any => {
    const pathParts = path.split('/').filter(part => part !== '');
    let current = currentData;
    let currentPath = '';

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      currentPath += `/${part}`;

      if (current[part] === undefined || current[part] === null) {
        // 检查下一个部分是否是数组索引
        const nextPart = pathParts[i + 1];
        const isNextPartArrayIndex = /^\d+$/.test(nextPart) || nextPart === '-';

        // 如果下一个部分是数组索引，创建数组，否则创建对象
        current[part] = isNextPartArrayIndex ? [] : {};
      }

      current = current[part];
    }

    return currentData;
  }, []);

  // 验证操作
  const validateOperation = useCallback((operation: JsonPatchOperation): JsonPatchError | null => {
    if (!validatePath(operation.path)) {
      return {
        message: '路径必须以 "/" 开头',
        operation: operation as jsonpatch.Operation,
        code: 'INVALID_PATH'
      };
    }

    if (['move', 'copy'].includes(operation.op) && operation.from && !validatePath(operation.from)) {
      return {
        message: '源路径必须以 "/" 开头',
        operation: operation as jsonpatch.Operation,
        code: 'INVALID_FROM_PATH'
      };
    }

    if (config.enableValidation) {
      try {
        const testOp = { ...operation } as jsonpatch.Operation;
        if ('value' in testOp && testOp.value !== undefined) {
          (testOp as any).value = parseJsonValue((testOp as any).value);
        }

        const errors = jsonpatch.validate([testOp], data);
        if (errors) {
          return {
            message: `验证失败: ${errors.name || '无效操作'}`,
            operation: testOp,
            code: 'VALIDATION_ERROR'
          };
        }
      } catch (error: any) {
        return {
          message: `验证错误: ${error.message}`,
          operation: operation as jsonpatch.Operation,
          code: 'VALIDATION_EXCEPTION'
        };
      }
    }

    return null;
  }, [data, config.enableValidation, parseJsonValue, validatePath]);

  // 应用单个操作
  const applyOperation = useCallback(async (operation: JsonPatchOperation): Promise<boolean> => {
    try {
      // 验证操作
      const validationError = validateOperation(operation);
      if (validationError) {
        config.onError(validationError);
        return false;
      }

      // 创建数据副本
      let workingData = JSON.parse(JSON.stringify(data));

      // 对于 add 操作，确保父路径存在
      if (operation.op === 'add') {
        workingData = ensurePathExists(operation.path, workingData);
      }

      // 准备操作对象
      let patchOp: jsonpatch.Operation;

      switch (operation.op) {
        case 'add':
        case 'replace':
          patchOp = {
            op: operation.op,
            path: operation.path,
            value: parseJsonValue(operation.value)
          };
          break;
        case 'remove':
          patchOp = {
            op: 'remove',
            path: operation.path
          };
          break;
        case 'move':
        case 'copy':
          if (!operation.from) {
            throw new Error(`${operation.op} 操作需要 from 路径`);
          }
          patchOp = {
            op: operation.op,
            from: operation.from,
            path: operation.path
          };
          break;
        case 'test':
          patchOp = {
            op: 'test',
            path: operation.path,
            value: parseJsonValue(operation.value)
          };
          break;
        default:
          throw new Error(`不支持的操作类型: ${operation.op}`);
      }

      // 应用操作
      const newData = jsonpatch.applyPatch(
        workingData,
        [patchOp]
      ).newDocument;

      // 更新状态
      setDataState(newData);
      setOperations(prev => [...prev, patchOp]);

      // 添加到历史记录
      const historyEntry: JsonPatchHistory = {
        operation: patchOp,
        result: newData,
        timestamp: Date.now()
      };

      setHistory(prev => {
        const newHistory = [...prev, historyEntry];
        return newHistory.slice(-config.maxHistorySize);
      });

      // 清空重做栈
      setRedoStack([]);

      config.onSuccess(patchOp, newData);
      return true;

    } catch (error: any) {
      const patchError: JsonPatchError = {
        message: `操作失败: ${error.message || '未知错误'}`,
        operation: operation as jsonpatch.Operation,
        code: 'OPERATION_ERROR'
      };
      config.onError(patchError);
      return false;
    }
  }, [data, validateOperation, parseJsonValue, config, ensurePathExists]);

  // 应用补丁数组
  const applyPatch = useCallback(async (patch: jsonpatch.Operation[]): Promise<boolean> => {
    try {
      if (config.enableValidation) {
        const errors = jsonpatch.validate(patch, data);
        if (errors) {
          throw new Error(`补丁验证失败: ${errors.name}`);
        }
      }

      const newData = jsonpatch.applyPatch(
        JSON.parse(JSON.stringify(data)),
        patch
      ).newDocument;

      setDataState(newData);
      setOperations(prev => [...prev, ...patch]);

      // 添加到历史记录
      const historyEntry: JsonPatchHistory = {
        operation: { op: 'add', path: '/batch', value: patch } as jsonpatch.Operation,
        result: newData,
        timestamp: Date.now()
      };

      setHistory(prev => {
        const newHistory = [...prev, historyEntry];
        return newHistory.slice(-config.maxHistorySize);
      });

      setRedoStack([]);

      config.onSuccess(historyEntry.operation, newData);
      return true;

    } catch (error: any) {
      const patchError: JsonPatchError = {
        message: `补丁应用失败: ${error.message || '未知错误'}`,
        code: 'PATCH_ERROR'
      };
      config.onError(patchError);
      return false;
    }
  }, [data, config]);

  // 撤销操作
  const undo = useCallback((): boolean => {
    if (history.length === 0) return false;

    const lastEntry = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const previousData = newHistory.length > 0
      ? newHistory[newHistory.length - 1].result
      : originalData;

    setDataState(previousData);
    setHistory(newHistory);
    setOperations(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastEntry]);

    return true;
  }, [history, originalData]);

  // 重做操作
  const redo = useCallback((): boolean => {
    if (redoStack.length === 0) return false;

    const nextEntry = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setDataState(nextEntry.result);
    setHistory(prev => [...prev, nextEntry]);
    setOperations(prev => [...prev, nextEntry.operation]);
    setRedoStack(newRedoStack);

    return true;
  }, [redoStack]);

  // 重置到原始状态
  const reset = useCallback(() => {
    setDataState(JSON.parse(JSON.stringify(originalData)));
    setOperations([]);
    setHistory([]);
    setRedoStack([]);
  }, [originalData]);

  // 设置新数据
  const setData = useCallback((newData: any) => {
    setDataState(JSON.parse(JSON.stringify(newData)));
    setOperations([]);
    setHistory([]);
    setRedoStack([]);
  }, []);

  // 生成补丁
  const generatePatch = useCallback((from?: any, to?: any): jsonpatch.Operation[] => {
    const sourceData = from || originalData;
    const targetData = to || data;
    return jsonpatch.compare(sourceData, targetData);
  }, [originalData, data]);

  // 获取路径对应的值
  const getValueByPath = useCallback((path: string): any => {
    try {
      return jsonpatch.getValueByPointer(data, path);
    } catch {
      return undefined;
    }
  }, [data]);

  // 检查路径是否存在
  const pathExists = useCallback((path: string): boolean => {
    try {
      jsonpatch.getValueByPointer(data, path);
      return true;
    } catch {
      return false;
    }
  }, [data]);

  // 便捷操作方法
  const add = useCallback((path: string, value: any) =>
    applyOperation({ op: 'add', path, value }), [applyOperation]);

  // 自动创建路径的 add 操作（禁用验证以允许创建不存在的路径）
  const addWithPath = useCallback(async (path: string, value: any): Promise<boolean> => {
    const originalValidation = config.enableValidation;
    try {
      // 临时禁用验证
      config.enableValidation = false;
      return await applyOperation({ op: 'add', path, value });
    } finally {
      // 恢复原始验证设置
      config.enableValidation = originalValidation;
    }
  }, [applyOperation, config]);

  const remove = useCallback((path: string) =>
    applyOperation({ op: 'remove', path }), [applyOperation]);

  const replace = useCallback((path: string, value: any) =>
    applyOperation({ op: 'replace', path, value }), [applyOperation]);

  const move = useCallback((from: string, to: string) =>
    applyOperation({ op: 'move', from, path: to }), [applyOperation]);

  const copy = useCallback((from: string, to: string) =>
    applyOperation({ op: 'copy', from, path: to }), [applyOperation]);

  const test = useCallback((path: string, value: any) =>
    applyOperation({ op: 'test', path, value }), [applyOperation]);

  const append = useCallback(async (path: string, text: string): Promise<boolean> => {
    try {
      const currentValue = getValueByPath(path);
      if (typeof currentValue !== 'string') {
        const error: JsonPatchError = {
          message: '只能对字符串值进行追加操作',
          code: 'INVALID_APPEND_TARGET'
        };
        config.onError(error);
        return false;
      }
      return await replace(path, currentValue + text);
    } catch (error: any) {
      const patchError: JsonPatchError = {
        message: `追加操作失败: ${error.message}`,
        code: 'APPEND_ERROR'
      };
      config.onError(patchError);
      return false;
    }
  }, [getValueByPath, replace, config]);

  // 计算派生状态
  const canUndo = useMemo(() => history.length > 0, [history.length]);
  const canRedo = useMemo(() => redoStack.length > 0, [redoStack.length]);

  return {
    // 状态
    data,
    originalData,
    operations,
    history,
    canUndo,
    canRedo,

    // 操作方法
    applyOperation,
    applyPatch,
    undo,
    redo,
    reset,
    setData,

    // 工具方法
    generatePatch,
    validateOperation,
    getValueByPath,
    pathExists,

    // 便捷操作
    add,
    addWithPath,
    remove,
    replace,
    move,
    copy,
    test,
    append,
  };
};

export default useJsonPatch;
