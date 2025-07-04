import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import AddSymbolForm from './AddSymbolForm.svelte';

describe('AddSymbolForm', () => {
  it('renders form and validates input', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(AddSymbolForm);

    const input = getByPlaceholderText('Symbol');
    const button = getByText('Add');

    await fireEvent.input(input, { target: { value: '' } });
    await fireEvent.click(button);

    expect(queryByText('Symbol is required')).toBeTruthy();
  });
});
