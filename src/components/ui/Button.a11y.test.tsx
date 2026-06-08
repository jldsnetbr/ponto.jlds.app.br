import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button } from './Button';

test('Button nao possui violacoes de acessibilidade', async () => {
  const { container } = render(<Button>Clique aqui</Button>);
  const result = await axe(container);
  expect(result.violations).toHaveLength(0);
});
