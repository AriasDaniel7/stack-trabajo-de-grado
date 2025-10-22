import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Directive, ElementRef, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
  host: {
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class NumberFormatDirective {
  private elementRef = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });
  private currencyPipe = new DecimalPipe('es-CO');
  private allowedKeys = ['Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];

  maxIntegerDigits = input(10);
  maxDecimalDigits = input(2);

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Guardar posición del cursor antes de modificar
    const cursorPosition = input.selectionStart || 0;

    // Remover todo excepto dígitos y comas
    value = value.replace(/[^\d,]/g, '');

    // Asegurar solo una coma
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }

    // Separar parte entera y decimal
    const [integerPart, decimalPart] = value.split(',');

    // Limitar dígitos
    const limitedInteger = integerPart.substring(0, this.maxIntegerDigits());
    const limitedDecimal =
      decimalPart !== undefined ? decimalPart.substring(0, this.maxDecimalDigits()) : undefined;

    // Construir valor numérico para el modelo
    const numericValue =
      limitedDecimal !== undefined ? `${limitedInteger}.${limitedDecimal}` : limitedInteger;

    // Formatear usando DecimalPipe
    const numericValueForPipe = parseFloat(numericValue || '');
    const formatted =
      this.currencyPipe.transform(numericValueForPipe, `1.0-${this.maxDecimalDigits()}`) || '';

    // Si hay coma al final (usuario escribiendo decimales), preservarla
    let displayValue = formatted;
    if (limitedDecimal !== undefined && limitedDecimal === '') {
      displayValue = formatted + ',';
    }

    input.value = displayValue;

    // Actualizar el modelo del formulario si existe
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(displayValue, {
        emitEvent: false,
      });
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // Permitir teclas de control
    if (this.allowedKeys.includes(event.key)) return;

    // Permitir atajos de teclado
    if (
      (event.ctrlKey || event.metaKey) &&
      ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())
    ) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const cursorPosition = input.selectionStart || 0;
    const hasSelection = (input.selectionEnd || 0) !== cursorPosition;

    // Permitir números
    if (/^\d$/.test(event.key)) {
      // Si hay una selección, permitir
      if (hasSelection) return;

      // Limpiar el valor para validar longitud real
      const cleanValue = currentValue.replace(/\./g, '');
      const parts = cleanValue.split(',');
      const beforeCursor = currentValue.substring(0, cursorPosition);
      const isBeforeComma = !beforeCursor.includes(',');

      if (isBeforeComma) {
        // Estamos en la parte entera
        const integerPart = parts[0] || '';
        if (integerPart.length >= this.maxIntegerDigits()) {
          event.preventDefault();
        }
      } else {
        // Estamos en la parte decimal
        const decimalPart = parts[1] || '';
        if (decimalPart.length >= this.maxDecimalDigits()) {
          event.preventDefault();
        }
      }
      return;
    }

    // Permitir coma solo si maxDecimalDigits > 0 y no hay otra coma
    if (event.key === ',') {
      if (this.maxDecimalDigits() === 0) {
        event.preventDefault();
        return;
      }
      const cleanValue = currentValue.replace(/\./g, '');
      if (cleanValue.includes(',') || cleanValue.length === 0) {
        event.preventDefault();
      }
      return;
    }

    // Bloquear cualquier otra tecla
    event.preventDefault();
  }
}
