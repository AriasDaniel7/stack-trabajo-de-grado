import { AbstractControl, FormArray, FormGroup, ValidationErrors } from '@angular/forms';

export class FormUtil {
  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'email':
          return 'El formato del correo electrónico es inválido';
        case 'min':
          return `El valor debe ser mayor o igual a ${errors[key].min}`;
        case 'max':
          return `El valor debe ser menor o igual a ${errors[key].max}`;
        case 'maxlength':
          return `El valor debe tener máximo ${errors[key].requiredLength} caracteres`;
        case 'minlength':
          return `El valor debe tener mínimo ${errors[key].requiredLength} caracteres`;
        case 'passwordsMismatch':
          return 'Las contraseñas no coinciden';
        default:
          return `Error de validación no controlado ${key}`;
      }
    }

    return null;
  }

  static isValidField(form: FormGroup, fieldName: string) {
    return form.controls[fieldName].errors && form.controls[fieldName].touched;
  }

  static isValidFieldInArray(formArray: FormArray, index: number, fieldName: string) {
    const group = formArray.at(index) as FormGroup;
    return FormUtil.isValidField(group, fieldName);
  }

  static getFieldErrorInArray(
    formArray: FormArray,
    index: number,
    fieldName: string
  ): string | null {
    const group = formArray.at(index) as FormGroup;
    return FormUtil.getFieldError(group, fieldName);
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtil.getTextError(errors);
  }

  static isFieldOneEqualToFieldTwo(field1: string, field2: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const value1 = formGroup.get(field1)?.value;
      const value2 = formGroup.get(field2)?.value;

      if (value1 && value2 && value1 !== value2) {
        const confirmField = formGroup.get(field2);
        confirmField?.setErrors({ ...confirmField.errors, passwordsMismatch: true });
        return { passwordsMismatch: true };
      }

      return null;
    };
  }

  static getFormError(form: FormGroup): string | null {
    const errors = form.errors ?? {};

    if (Object.keys(errors).length === 0) return null;

    return FormUtil.getTextError(errors);
  }
}
