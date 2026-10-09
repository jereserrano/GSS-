import { describe, it, expect } from 'vitest';
import { resetPasswordAction } from '../../actions/auth.actions';

describe('Recuperación de Contraseña', () => {
  it('Debe rechazar un token inválido', async () => {
    const res = await resetPasswordAction('INVALID_TOKEN_123', 'nuevaClave123');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Token inválido');
  });
});
