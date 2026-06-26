import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDruzyny } from '../useDruzyny';
import { druzynyService } from '../../services';

vi.mock('../../services', () => ({
  druzynyService: { getAll: vi.fn() },
}));

describe('useDruzyny', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ładuje drużyny i ustawia loading=false', async () => {
    druzynyService.getAll.mockResolvedValue({ data: [{ _id: '1', nazwa: 'U12' }] });
    const { result } = renderHook(() => useDruzyny());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.druzyny).toHaveLength(1);
    expect(result.current.druzyny[0].nazwa).toBe('U12');
  });

  it('ustawia error przy niepowodzeniu', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    druzynyService.getAll.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useDruzyny());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.druzyny).toHaveLength(0);
  });
});
