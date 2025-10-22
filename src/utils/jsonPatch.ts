import * as jsonpatch from 'fast-json-patch';

/**
 * JSON Patch 操作类型
 */
export type JsonPatchOperationType = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test' | 'append';

/**
 * JSON Patch 操作接口
 */
export interface JsonPatchOperation {
  op: JsonPatchOperationType;
  path: string;
  value?: any;
  from?: string;
}

/**
 * JSON Patch 错误接口
 */
export interface JsonPatchError {
  message: string;
  operation?: JsonPatchOperation;
  code?: string;
}

/**
 * JSON Patch 结果接口
 */
export interface JsonPatchResult {
  success: boolean;
  data?: any;
  error?: JsonPatchError;
  appliedOperations?: JsonPatchOperation[];
}

/**
 * 验证 JSON Patch 操作
 */
function validateOperation(operation: JsonPatchOperation): JsonPatchError | null {
  // 验证路径格式
  if (!operation.path || !operation.path.startsWith('/')) {
    return {
      message: '路径必须以 "/" 开头',
      operation,
      code: 'INVALID_PATH'
    };
  }

  // 验证操作类型
  const validOps: JsonPatchOperationType[] = ['add', 'remove', 'replace', 'move', 'copy', 'test', 'append'];
  if (!validOps.includes(operation.op)) {
    return {
      message: `不支持的操作类型: ${operation.op}`,
      operation,
      code: 'INVALID_OPERATION'
    };
  }

  // 验证 move 和 copy 操作的 from 路径
  if (['move', 'copy'].includes(operation.op)) {
    if (!operation.from || !operation.from.startsWith('/')) {
      return {
        message: 'move 和 copy 操作需要有效的 from 路径',
        operation,
        code: 'INVALID_FROM_PATH'
      };
    }
  }

  // 验证需要 value 的操作
  if (['add', 'replace', 'test', 'append'].includes(operation.op) && operation.value === undefined) {
    return {
      message: `${operation.op} 操作需要 value 参数`,
      operation,
      code: 'MISSING_VALUE'
    };
  }

  return null;
}

/**
 * 解析 JSON 值
 */
function parseJsonValue(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * 确保路径存在（自动创建缺失的父路径）
 */
function ensurePathExists(path: string, data: any): any {
  const pathParts = path.split('/').filter(part => part !== '');
  let current = data;
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

  return data;
}

/**
 * 应用单个 JSON Patch 操作
 * @param data 要处理的数据
 * @param operation JSON Patch 操作
 * @returns 处理结果
 */
export function applyJsonPatchOperation(data: any, operation: JsonPatchOperation): JsonPatchResult {
  try {
    // 验证操作
    const validationError = validateOperation(operation);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // 创建数据副本
    let workingData = JSON.parse(JSON.stringify(data));

    // 对于 add 操作，确保父路径存在
    if (operation.op === 'add') {
      workingData = ensurePathExists(operation.path, workingData);
    }

    // 准备标准的 JSON Patch 操作
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
        patchOp = {
          op: operation.op,
          from: operation.from!,
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
      case 'append':
        // append操作通过appendString函数处理，这里不应该到达
        return appendString(workingData, operation.path, operation.value || '');
      default:
        throw new Error(`不支持的操作类型: ${operation.op}`);
    }

    // 应用操作
    const result = jsonpatch.applyPatch(workingData, [patchOp]);

    return {
      success: true,
      data: result.newDocument,
      appliedOperations: [operation]
    };

  } catch (error: any) {
    return {
      success: false,
      error: {
        message: `操作失败: ${error.message || '未知错误'}`,
        operation,
        code: 'OPERATION_ERROR'
      }
    };
  }
}

/**
 * 应用 JSON Patch 操作数组
 * @param data 要处理的数据
 * @param patch JSON Patch 操作数组
 * @returns 处理结果
 */
export function applyJsonPatch(data: any, patch: JsonPatchOperation[]): JsonPatchResult {
  try {
    if (!Array.isArray(patch)) {
      return {
        success: false,
        error: {
          message: 'patch 必须是操作数组',
          code: 'INVALID_PATCH'
        }
      };
    }

    if (patch.length === 0) {
      return {
        success: true,
        data: JSON.parse(JSON.stringify(data)),
        appliedOperations: []
      };
    }

    // 验证所有操作
    for (const operation of patch) {
      const validationError = validateOperation(operation);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }
    }

    // 创建数据副本
    let workingData = JSON.parse(JSON.stringify(data));

    // 分离append操作和标准操作
    const standardOperations: JsonPatchOperation[] = [];
    const appendOperations: JsonPatchOperation[] = [];

    patch.forEach(operation => {
      if (operation.op === 'append') {
        appendOperations.push(operation);
      } else {
        standardOperations.push(operation);
      }
    });

    // 先处理标准操作
    if (standardOperations.length > 0) {
      const standardPatch: jsonpatch.Operation[] = standardOperations.map(operation => {
        // 对于 add 操作，确保父路径存在
        if (operation.op === 'add') {
          workingData = ensurePathExists(operation.path, workingData);
        }

        switch (operation.op) {
          case 'add':
          case 'replace':
            return {
              op: operation.op,
              path: operation.path,
              value: parseJsonValue(operation.value)
            };
          case 'remove':
            return {
              op: 'remove',
              path: operation.path
            };
          case 'move':
          case 'copy':
            return {
              op: operation.op,
              from: operation.from!,
              path: operation.path
            };
          case 'test':
            return {
              op: 'test',
              path: operation.path,
              value: parseJsonValue(operation.value)
            };
          default:
            throw new Error(`不支持的操作类型: ${operation.op}`);
        }
      });

      // 应用标准操作
      const result = jsonpatch.applyPatch(workingData, standardPatch);
      workingData = result.newDocument;
    }

    // 然后处理append操作
    for (const operation of appendOperations) {
      const appendResult = appendString(workingData, operation.path, operation.value || '');
      if (!appendResult.success) {
        return appendResult;
      }
      workingData = appendResult.data;
    }

    return {
      success: true,
      data: workingData,
      appliedOperations: patch
    };

  } catch (error: any) {
    return {
      success: false,
      error: {
        message: `补丁应用失败: ${error.message || '未知错误'}`,
        code: 'PATCH_ERROR'
      }
    };
  }
}

/**
 * 生成两个对象之间的 JSON Patch
 * @param from 源对象
 * @param to 目标对象
 * @returns JSON Patch 操作数组
 */
export function generateJsonPatch(from: any, to: any): JsonPatchOperation[] {
  const patch = jsonpatch.compare(from, to);
  return patch.map(op => ({
    op: op.op as JsonPatchOperationType,
    path: op.path,
    value: 'value' in op ? op.value : undefined,
    from: 'from' in op ? op.from : undefined
  }));
}

/**
 * 验证 JSON Patch 操作数组
 * @param patch JSON Patch 操作数组
 * @param data 要验证的数据
 * @returns 验证结果
 */
export function validateJsonPatch(patch: JsonPatchOperation[], data: any): JsonPatchError | null {
  try {
    for (const operation of patch) {
      const error = validateOperation(operation);
      if (error) {
        return error;
      }
    }

    // 使用 fast-json-patch 进行深度验证
    const standardPatch: jsonpatch.Operation[] = patch.map(op => ({
      op: op.op as any,
      path: op.path,
      value: 'value' in op ? parseJsonValue(op.value) : undefined,
      from: op.from
    }));

    const errors = jsonpatch.validate(standardPatch, data);
    if (errors) {
      return {
        message: `验证失败: ${errors.name || '无效操作'}`,
        code: 'VALIDATION_ERROR'
      };
    }

    return null;
  } catch (error: any) {
    return {
      message: `验证错误: ${error.message}`,
      code: 'VALIDATION_EXCEPTION'
    };
  }
}

/**
 * 获取指定路径的值
 * @param data 数据对象
 * @param path JSON Pointer 路径
 * @returns 路径对应的值，如果路径不存在则返回 undefined
 */
export function getValueByPath(data: any, path: string): any {
  try {
    return jsonpatch.getValueByPointer(data, path);
  } catch {
    return undefined;
  }
}

/**
 * 检查路径是否存在
 * @param data 数据对象
 * @param path JSON Pointer 路径
 * @returns 路径是否存在
 */
export function pathExists(data: any, path: string): boolean {
  try {
    jsonpatch.getValueByPointer(data, path);
    return true;
  } catch {
    return false;
  }
}

/**
 * 便捷方法：添加值
 */
export function addValue(data: any, path: string, value: any): JsonPatchResult {
  return applyJsonPatchOperation(data, { op: 'add', path, value });
}

/**
 * 便捷方法：删除值
 */
export function removeValue(data: any, path: string): JsonPatchResult {
  return applyJsonPatchOperation(data, { op: 'remove', path });
}

/**
 * 便捷方法：替换值
 */
export function replaceValue(data: any, path: string, value: any): JsonPatchResult {
  return applyJsonPatchOperation(data, { op: 'replace', path, value });
}

/**
 * 便捷方法：移动值
 */
export function moveValue(data: any, from: string, to: string): JsonPatchResult {
  return applyJsonPatchOperation(data, { op: 'move', from, path: to });
}

/**
 * 便捷方法：复制值
 */
export function copyValue(data: any, from: string, to: string): JsonPatchResult {
  return applyJsonPatchOperation(data, { op: 'copy', from, path: to });
}

/**
 * 便捷方法：测试值
 */
export function testValue(data: any, path: string, value: any): JsonPatchResult {
  return applyJsonPatchOperation(data, { op: 'test', path, value });
}

/**
 * 便捷方法：追加字符串
 * @param data 数据对象
 * @param path JSON Pointer 路径
 * @param appendText 要追加的字符串
 * @returns 处理结果
 */
export function appendString(data: any, path: string, appendText: string): JsonPatchResult {
  try {
    // 获取当前值
    const currentValue = getValueByPath(data, path);

    // 检查路径是否存在
    if (currentValue === undefined) {
      return {
        success: false,
        error: {
          message: `路径 ${path} 不存在，无法追加字符串`,
          code: 'PATH_NOT_EXISTS'
        }
      };
    }

    // 检查当前值是否为字符串
    if (typeof currentValue !== 'string') {
      return {
        success: false,
        error: {
          message: `路径 ${path} 的值不是字符串类型，当前类型: ${typeof currentValue}`,
          code: 'INVALID_TYPE'
        }
      };
    }

    // 检查追加内容是否为字符串
    if (typeof appendText !== 'string') {
      return {
        success: false,
        error: {
          message: `追加内容必须是字符串类型，当前类型: ${typeof appendText}`,
          code: 'INVALID_APPEND_TYPE'
        }
      };
    }

    // 创建新的值（原值 + 追加内容）
    const newValue = currentValue + appendText;

    // 使用 replace 操作来更新值
    return applyJsonPatchOperation(data, { op: 'replace', path, value: newValue });

  } catch (error: any) {
    return {
      success: false,
      error: {
        message: `追加字符串失败: ${error.message || '未知错误'}`,
        code: 'APPEND_ERROR'
      }
    };
  }
}

// 默认导出主要的应用方法
export default applyJsonPatch;
