import { renderHook, act } from '@testing-library/react';
import { useJsonPatch } from '../useJsonPatch';

// 模拟测试数据
const initialData = {
  name: 'John Doe',
  age: 30,
  hobbies: ['reading', 'gaming'],
  address: {
    city: 'New York',
    country: 'USA'
  }
};

describe('useJsonPatch', () => {
  it('should initialize with initial data', () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    expect(result.current.data).toEqual(initialData);
    expect(result.current.originalData).toEqual(initialData);
    expect(result.current.operations).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should add a new property', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      const success = await result.current.add('/email', 'john@example.com');
      expect(success).toBe(true);
    });

    expect(result.current.data.email).toBe('john@example.com');
    expect(result.current.operations).toHaveLength(1);
    expect(result.current.operations[0].op).toBe('add');
    expect(result.current.canUndo).toBe(true);
  });

  it('should add property with auto-created path', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      // 测试自动创建不存在的路径
      const success = await result.current.addWithPath('/extra/nested/deep/value', 'auto-created');
      expect(success).toBe(true);
    });

    expect(result.current.data.extra.nested.deep.value).toBe('auto-created');
    expect(result.current.operations).toHaveLength(1);
    expect(result.current.operations[0].op).toBe('add');
    expect(result.current.canUndo).toBe(true);
  });

  it('should auto-create array when path suggests array index', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      // 测试自动创建数组
      const success = await result.current.addWithPath('/items/0', 'first item');
      expect(success).toBe(true);
    });

    expect(Array.isArray(result.current.data.items)).toBe(true);
    expect(result.current.data.items[0]).toBe('first item');
  });

  it('should remove a property', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      await result.current.remove('/age');
    });

    expect(result.current.data.age).toBeUndefined();
    expect(result.current.operations).toHaveLength(1);
    expect(result.current.operations[0].op).toBe('remove');
  });

  it('should replace a property', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      await result.current.replace('/name', 'Jane Doe');
    });

    expect(result.current.data.name).toBe('Jane Doe');
    expect(result.current.operations[0].op).toBe('replace');
  });

  it('should move a property', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      await result.current.move('/address/city', '/location');
    });

    expect(result.current.data.location).toBe('New York');
    expect(result.current.data.address.city).toBeUndefined();
  });

  it('should copy a property', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      await result.current.copy('/name', '/displayName');
    });

    expect(result.current.data.displayName).toBe('John Doe');
    expect(result.current.data.name).toBe('John Doe'); // 原值保持不变
  });

  it('should test a property value', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      const success = await result.current.test('/name', 'John Doe');
      expect(success).toBe(true);
    });

    // test 操作不会改变数据
    expect(result.current.data).toEqual(initialData);
  });

  it('should append text to string', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    await act(async () => {
      await result.current.append('/name', ' Jr.');
    });

    expect(result.current.data.name).toBe('John Doe Jr.');
  });

  it('should handle undo and redo', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    // 执行一个操作
    await act(async () => {
      await result.current.replace('/name', 'Jane Doe');
    });

    expect(result.current.data.name).toBe('Jane Doe');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    // 撤销操作
    act(() => {
      result.current.undo();
    });

    expect(result.current.data.name).toBe('John Doe');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    // 重做操作
    act(() => {
      result.current.redo();
    });

    expect(result.current.data.name).toBe('Jane Doe');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should reset to original data', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    // 执行一些操作
    await act(async () => {
      await result.current.replace('/name', 'Jane Doe');
      await result.current.add('/email', 'jane@example.com');
    });

    expect(result.current.operations).toHaveLength(2);

    // 重置
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual(initialData);
    expect(result.current.operations).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should get value by path', () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    expect(result.current.getValueByPath('/name')).toBe('John Doe');
    expect(result.current.getValueByPath('/address/city')).toBe('New York');
    expect(result.current.getValueByPath('/hobbies/0')).toBe('reading');
  });

  it('should check if path exists', () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    expect(result.current.pathExists('/name')).toBe(true);
    expect(result.current.pathExists('/address/city')).toBe(true);
    expect(result.current.pathExists('/nonexistent')).toBe(false);
  });

  it('should generate patch from comparison', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    // 修改数据
    await act(async () => {
      await result.current.replace('/name', 'Jane Doe');
      await result.current.add('/email', 'jane@example.com');
    });

    const patch = result.current.generatePatch();
    expect(patch).toHaveLength(2);
    expect(patch[0].op).toBe('replace');
    expect(patch[0].path).toBe('/name');
    expect(patch[1].op).toBe('add');
    expect(patch[1].path).toBe('/email');
  });

  it('should handle error callbacks', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useJsonPatch({
        initialData,
        onError,
        enableValidation: true
      })
    );

    // 尝试无效路径
    await act(async () => {
      await result.current.add('invalid-path', 'value');
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('路径必须以 "/" 开头'),
        code: 'INVALID_PATH'
      })
    );
  });

  it('should handle success callbacks', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useJsonPatch({
        initialData,
        onSuccess
      })
    );

    await act(async () => {
      await result.current.add('/email', 'john@example.com');
    });

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        op: 'add',
        path: '/email',
        value: 'john@example.com'
      }),
      expect.objectContaining({
        email: 'john@example.com'
      })
    );
  });

  it('should apply batch operations', async () => {
    const { result } = renderHook(() => useJsonPatch({ initialData }));

    const patch = [
      { op: 'replace' as const, path: '/name', value: 'Jane Doe' },
      { op: 'add' as const, path: '/email', value: 'jane@example.com' },
      { op: 'remove' as const, path: '/age' }
    ];

    await act(async () => {
      const success = await result.current.applyPatch(patch);
      expect(success).toBe(true);
    });

    expect(result.current.data.name).toBe('Jane Doe');
    expect(result.current.data.email).toBe('jane@example.com');
    expect(result.current.data.age).toBeUndefined();
  });
});
